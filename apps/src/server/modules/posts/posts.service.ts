import type { Prisma } from "@prisma/client";
import { getAppUrl } from "@/server/env";
import { prisma } from "@/server/prisma";
import { AppError } from "@/server/common/AppError";
import type { CreatePostInput, ListPostsInput, TaxonomyInput, UpdatePostInput } from "./posts.schemas";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function buildUniqueSlug(title: string, postId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await prisma.post.findFirst({
      where: {
        slug,
        isDeleted: false,
        ...(postId ? { id: { not: postId } } : {})
      }
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

function mediaUrl(mediaId: string | null) {
  return mediaId ? `${getAppUrl()}/api/v1/media/${mediaId}` : null;
}

function toPostResponse(
  post: Prisma.PostGetPayload<{
    include: {
      author: true;
      category: true;
      tags: {
        include: {
          tag: true;
        };
      };
    };
  }>
) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    coverImageId: post.coverImageId,
    coverImageUrl: mediaUrl(post.coverImageId),
    category: post.category && !post.category.isDeleted
      ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug
        }
      : null,
    tags: post.tags
      .filter((item) => !item.tag.isDeleted)
      .map((item) => ({
        id: item.tag.id,
        name: item.tag.name,
        slug: item.tag.slug
      })),
    author: {
      id: post.author.id,
      firstName: post.author.firstName,
      lastName: post.author.lastName
    },
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
  };
}

function toCategoryResponse(category: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { posts: number };
}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    postsCount: category._count?.posts ?? 0,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  };
}

function toTagResponse(tag: {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { posts: number };
}) {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postsCount: tag._count?.posts ?? 0,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt
  };
}

async function createMedia(input: NonNullable<CreatePostInput["coverImage"]>, actorId: string) {
  const data = Buffer.from(input.dataBase64.replace(/^data:[^;]+;base64,/, ""), "base64");

  if (data.byteLength > 2 * 1024 * 1024) {
    throw new AppError("La imagen no puede superar 2MB.", 422, "MEDIA_TOO_LARGE");
  }

  const media = await prisma.mediaFile.create({
    data: {
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: data.byteLength,
      data,
      createdById: actorId
    }
  });

  return media.id;
}

export async function listPosts(input: ListPostsInput) {
  const where: Prisma.PostWhereInput = {
    isDeleted: false,
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { title: { contains: input.q, mode: "insensitive" } },
            { excerpt: { contains: input.q, mode: "insensitive" } },
            { slug: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const skip = (input.page - 1) * input.pageSize;
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        coverImageId: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        category: true,
        tags: {
          include: { tag: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize
    }),
    prisma.post.count({ where })
  ]);

  return {
    items: items.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: "",
      status: post.status,
      coverImageId: post.coverImageId,
      coverImageUrl: mediaUrl(post.coverImageId),
      category:
        post.category && !post.category.isDeleted
          ? {
              id: post.category.id,
              name: post.category.name,
              slug: post.category.slug
            }
          : null,
      tags: post.tags
        .filter((item) => !item.tag.isDeleted)
        .map((item) => ({
          id: item.tag.id,
          name: item.tag.name,
          slug: item.tag.slug
        })),
      author: {
        id: post.author.id,
        firstName: post.author.firstName,
        lastName: post.author.lastName
      },
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    })),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function listPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: {
      isDeleted: false,
      status: "PUBLISHED"
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: { tag: true }
      }
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }]
  });

  return posts.map(toPostResponse);
}

export async function getPublishedPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: {
      slug,
      isDeleted: false,
      status: "PUBLISHED"
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: { tag: true }
      }
    }
  });

  if (!post) {
    throw new AppError("La publicacion no existe o no esta publicada.", 404, "POST_NOT_FOUND");
  }

  return toPostResponse(post);
}

export async function getPostById(postId: string) {
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      isDeleted: false
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: { tag: true }
      }
    }
  });

  if (!post) {
    throw new AppError("La publicacion no existe o fue eliminada.", 404, "POST_NOT_FOUND");
  }

  return toPostResponse(post);
}

export async function createPost(input: CreatePostInput, actorId: string) {
  const coverImageId = input.coverImage ? await createMedia(input.coverImage, actorId) : null;
  await validateCategory(input.categoryId);
  const tags = await validateTags(input.tagIds);

  const post = await prisma.post.create({
    data: {
      title: input.title.trim(),
      slug: await buildUniqueSlug(input.title),
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      status: input.status,
      coverImageId,
      categoryId: input.categoryId || null,
      authorId: actorId,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      createdById: actorId,
      updatedById: actorId,
      tags: {
        create: tags.map((tag) => ({
          tagId: tag.id
        }))
      }
    },
    include: {
      author: true,
      category: true,
      tags: {
        include: { tag: true }
      }
    }
  });

  return toPostResponse(post);
}

export async function updatePost(postId: string, input: UpdatePostInput, actorId: string) {
  const existing = await prisma.post.findFirst({
    where: {
      id: postId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("La publicacion no existe o fue eliminada.", 404, "POST_NOT_FOUND");
  }

  const coverImageId = input.coverImage ? await createMedia(input.coverImage, actorId) : undefined;
  if (input.categoryId !== undefined) {
    await validateCategory(input.categoryId);
  }
  const tags = input.tagIds ? await validateTags(input.tagIds) : null;
  const nextStatus = input.status ?? existing.status;

  const post = await prisma.$transaction(async (tx) => {
    if (tags) {
      await tx.postTagRelation.deleteMany({ where: { postId } });
      await tx.postTagRelation.createMany({
        data: tags.map((tag) => ({
          postId,
          tagId: tag.id
        }))
      });
    }

    return tx.post.update({
      where: { id: postId },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim(), slug: await buildUniqueSlug(input.title, postId) } : {}),
        ...(input.excerpt !== undefined ? { excerpt: input.excerpt?.trim() || null } : {}),
        ...(input.content !== undefined ? { content: input.content } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
        ...(coverImageId !== undefined ? { coverImageId } : {}),
        publishedAt: nextStatus === "PUBLISHED" && !existing.publishedAt ? new Date() : nextStatus !== "PUBLISHED" ? null : existing.publishedAt,
        updatedById: actorId
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: { tag: true }
        }
      }
    });
  });

  return toPostResponse(post);
}

export async function deletePost(postId: string, actorId: string) {
  const existing = await prisma.post.findFirst({
    where: {
      id: postId,
      isDeleted: false
    }
  });

  if (!existing) {
    throw new AppError("La publicacion no existe o ya fue eliminada.", 404, "POST_NOT_FOUND");
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: postId };
}

export async function listCategories() {
  const categories = await prisma.postCategory.findMany({
    where: { isDeleted: false },
    include: {
      _count: {
        select: {
          posts: {
            where: { isDeleted: false }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return categories.map(toCategoryResponse);
}

export async function createCategory(input: TaxonomyInput, actorId: string) {
  const slug = await buildUniqueCategorySlug(input.name);
  const category = await prisma.postCategory.create({
    data: {
      name: input.name.trim(),
      slug,
      createdById: actorId,
      updatedById: actorId
    },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  return toCategoryResponse(category);
}

export async function updateCategory(categoryId: string, input: TaxonomyInput, actorId: string) {
  const existing = await prisma.postCategory.findFirst({
    where: { id: categoryId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("La categoria no existe o fue eliminada.", 404, "CATEGORY_NOT_FOUND");
  }

  const category = await prisma.postCategory.update({
    where: { id: categoryId },
    data: {
      name: input.name.trim(),
      slug: await buildUniqueCategorySlug(input.name, categoryId),
      updatedById: actorId
    },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  return toCategoryResponse(category);
}

export async function deleteCategory(categoryId: string, actorId: string) {
  const existing = await prisma.postCategory.findFirst({
    where: { id: categoryId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("La categoria no existe o ya fue eliminada.", 404, "CATEGORY_NOT_FOUND");
  }

  await prisma.postCategory.update({
    where: { id: categoryId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: categoryId };
}

export async function listTags() {
  const tags = await prisma.postTag.findMany({
    where: { isDeleted: false },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  return tags.map(toTagResponse);
}

export async function createTag(input: TaxonomyInput, actorId: string) {
  const tag = await prisma.postTag.create({
    data: {
      name: input.name.trim(),
      slug: await buildUniqueTagSlug(input.name),
      createdById: actorId,
      updatedById: actorId
    },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  return toTagResponse(tag);
}

export async function updateTag(tagId: string, input: TaxonomyInput, actorId: string) {
  const existing = await prisma.postTag.findFirst({
    where: { id: tagId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("La etiqueta no existe o fue eliminada.", 404, "TAG_NOT_FOUND");
  }

  const tag = await prisma.postTag.update({
    where: { id: tagId },
    data: {
      name: input.name.trim(),
      slug: await buildUniqueTagSlug(input.name, tagId),
      updatedById: actorId
    },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  });

  return toTagResponse(tag);
}

export async function deleteTag(tagId: string, actorId: string) {
  const existing = await prisma.postTag.findFirst({
    where: { id: tagId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("La etiqueta no existe o ya fue eliminada.", 404, "TAG_NOT_FOUND");
  }

  await prisma.postTag.update({
    where: { id: tagId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: tagId };
}

async function validateCategory(categoryId: string | null | undefined) {
  if (!categoryId) {
    return null;
  }

  const category = await prisma.postCategory.findFirst({
    where: { id: categoryId, isDeleted: false }
  });

  if (!category) {
    throw new AppError("La categoria seleccionada no es valida.", 422, "INVALID_CATEGORY");
  }

  return category;
}

async function validateTags(tagIds: string[] = []) {
  const uniqueTagIds = Array.from(new Set(tagIds));
  const tags = await prisma.postTag.findMany({
    where: { id: { in: uniqueTagIds }, isDeleted: false }
  });

  if (tags.length !== uniqueTagIds.length) {
    throw new AppError("Una o mas etiquetas seleccionadas no son validas.", 422, "INVALID_TAGS");
  }

  return tags;
}

async function buildUniqueCategorySlug(name: string, categoryId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await prisma.postCategory.findFirst({
      where: {
        slug,
        isDeleted: false,
        ...(categoryId ? { id: { not: categoryId } } : {})
      }
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

async function buildUniqueTagSlug(name: string, tagId?: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;

  while (
    await prisma.postTag.findFirst({
      where: {
        slug,
        isDeleted: false,
        ...(tagId ? { id: { not: tagId } } : {})
      }
    })
  ) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}
