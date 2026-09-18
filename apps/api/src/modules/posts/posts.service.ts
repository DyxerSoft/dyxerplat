import type { Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import type { CreatePostInput, ListPostsInput, ListPublicPostsInput, UpdatePostInput } from "./posts.schemas";

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
  return mediaId ? `${env.API_BASE_URL ?? `http://localhost:${env.API_PORT}`}/api/v1/media/${mediaId}` : null;
}

const postInclude = {
  author: true,
  category: true,
  tags: { include: { tag: true } }
} satisfies Prisma.PostInclude;

function toPostResponse(
  post: Prisma.PostGetPayload<{
    include: typeof postInclude;
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
    category: post.category ? { id: post.category.id, name: post.category.name, slug: post.category.slug } : null,
    tags: post.tags.map(({ tag }) => ({ id: tag.id, name: tag.name, slug: tag.slug })),
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
            { content: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const skip = (input.page - 1) * input.pageSize;
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize
    }),
    prisma.post.count({ where })
  ]);

  return {
    items: items.map(toPostResponse),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function listPublishedPosts(input: ListPublicPostsInput) {
  const where: Prisma.PostWhereInput = {
    isDeleted: false,
    status: "PUBLISHED",
    ...(input.q ? { OR: [{ title: { contains: input.q, mode: "insensitive" } }, { excerpt: { contains: input.q, mode: "insensitive" } }, { content: { contains: input.q, mode: "insensitive" } }] } : {}),
    ...(input.category ? { category: { slug: input.category, isDeleted: false } } : {}),
    ...(input.tag ? { tags: { some: { tag: { slug: input.tag, isDeleted: false } } } } : {})
  };
  const skip = (input.page - 1) * input.pageSize;
  const [posts, total, categories, tags] = await Promise.all([
    prisma.post.findMany({ where, include: postInclude, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], skip, take: input.pageSize }),
    prisma.post.count({ where }),
    prisma.postCategory.findMany({ where: { isDeleted: false, posts: { some: { isDeleted: false, status: "PUBLISHED" } } }, select: { id: true, name: true, slug: true, _count: { select: { posts: { where: { isDeleted: false, status: "PUBLISHED" } } } } }, orderBy: { name: "asc" } }),
    prisma.postTag.findMany({ where: { isDeleted: false, posts: { some: { post: { isDeleted: false, status: "PUBLISHED" } } } }, select: { id: true, name: true, slug: true, _count: { select: { posts: { where: { post: { isDeleted: false, status: "PUBLISHED" } } } } } }, orderBy: { name: "asc" } })
  ]);
  return { items: posts.map(toPostResponse), pagination: { page: input.page, pageSize: input.pageSize, total, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) }, filters: { categories, tags } };
}

export async function getPublishedPost(slug: string) {
  const post = await prisma.post.findFirst({
    where: {
      slug,
      isDeleted: false,
      status: "PUBLISHED"
    },
    include: postInclude
  });

  if (!post) {
    throw new AppError("La publicacion no existe o no esta publicada.", 404, "POST_NOT_FOUND");
  }

  return toPostResponse(post);
}

export async function createPost(input: CreatePostInput, actorId: string) {
  const coverImageId = input.coverImage ? await createMedia(input.coverImage, actorId) : null;
  await validateTaxonomies(input.categoryId || null, input.tagIds);
  const post = await prisma.post.create({
    data: {
      title: input.title.trim(),
      slug: await buildUniqueSlug(input.title),
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      status: input.status,
      coverImageId,
      categoryId: input.categoryId || null,
      tags: { create: input.tagIds.map((tagId) => ({ tagId })) },
      authorId: actorId,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      createdById: actorId,
      updatedById: actorId
    },
    include: postInclude
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
  if (input.categoryId !== undefined || input.tagIds !== undefined) await validateTaxonomies(input.categoryId || null, input.tagIds ?? []);
  const nextStatus = input.status ?? existing.status;
  const post = await prisma.$transaction(async (tx) => {
    if (input.tagIds !== undefined) {
      await tx.postTagRelation.deleteMany({ where: { postId } });
      await tx.postTagRelation.createMany({ data: input.tagIds.map((tagId) => ({ postId, tagId })) });
    }
    return tx.post.update({
    where: { id: postId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim(), slug: await buildUniqueSlug(input.title, postId) } : {}),
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt?.trim() || null } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(coverImageId !== undefined ? { coverImageId } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
      publishedAt: nextStatus === "PUBLISHED" && !existing.publishedAt ? new Date() : nextStatus !== "PUBLISHED" ? null : existing.publishedAt,
      updatedById: actorId
    },
    include: postInclude
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

async function validateTaxonomies(categoryId: string | null, tagIds: string[]) {
  if (categoryId) {
    const category = await prisma.postCategory.findFirst({ where: { id: categoryId, isDeleted: false } });
    if (!category) throw new AppError("La categoría seleccionada no existe o fue eliminada.", 422, "INVALID_CATEGORY");
  }
  const uniqueTagIds = Array.from(new Set(tagIds));
  const tags = await prisma.postTag.count({ where: { id: { in: uniqueTagIds }, isDeleted: false } });
  if (tags !== uniqueTagIds.length) throw new AppError("Uno o más tags seleccionados no existen o fueron eliminados.", 422, "INVALID_TAGS");
}

async function uniqueTaxonomySlug(name: string, type: "category" | "tag", exceptId?: string) {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (type === "category"
    ? await prisma.postCategory.findFirst({ where: { slug, isDeleted: false, ...(exceptId ? { id: { not: exceptId } } : {}) } })
    : await prisma.postTag.findFirst({ where: { slug, isDeleted: false, ...(exceptId ? { id: { not: exceptId } } : {}) } })) {
    slug = `${base}-${++suffix}`;
  }
  return slug;
}

export async function listCategories() {
  return prisma.postCategory.findMany({ where: { isDeleted: false }, include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });
}

export async function createCategory(input: { name: string }, actorId: string) {
  return prisma.postCategory.create({ data: { name: input.name.trim(), slug: await uniqueTaxonomySlug(input.name, "category"), createdById: actorId, updatedById: actorId }, include: { _count: { select: { posts: true } } } });
}

export async function updateCategory(id: string, input: { name?: string }, actorId: string) {
  const existing = await prisma.postCategory.findFirst({ where: { id, isDeleted: false } });
  if (!existing) throw new AppError("La categoría no existe o fue eliminada.", 404, "CATEGORY_NOT_FOUND");
  return prisma.postCategory.update({ where: { id }, data: { ...(input.name ? { name: input.name.trim(), slug: await uniqueTaxonomySlug(input.name, "category", id) } : {}), updatedById: actorId }, include: { _count: { select: { posts: true } } } });
}

export async function deleteCategory(id: string, actorId: string) {
  const existing = await prisma.postCategory.findFirst({ where: { id, isDeleted: false } });
  if (!existing) throw new AppError("La categoría no existe o ya fue eliminada.", 404, "CATEGORY_NOT_FOUND");
  await prisma.$transaction([prisma.post.updateMany({ where: { categoryId: id }, data: { categoryId: null } }), prisma.postCategory.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date(), deletedById: actorId, updatedById: actorId } })]);
  return { id };
}

export async function listTags() {
  return prisma.postTag.findMany({ where: { isDeleted: false }, include: { _count: { select: { posts: true } } }, orderBy: { name: "asc" } });
}

export async function createTag(input: { name: string }, actorId: string) {
  return prisma.postTag.create({ data: { name: input.name.trim(), slug: await uniqueTaxonomySlug(input.name, "tag"), createdById: actorId, updatedById: actorId }, include: { _count: { select: { posts: true } } } });
}

export async function updateTag(id: string, input: { name?: string }, actorId: string) {
  const existing = await prisma.postTag.findFirst({ where: { id, isDeleted: false } });
  if (!existing) throw new AppError("El tag no existe o fue eliminado.", 404, "TAG_NOT_FOUND");
  return prisma.postTag.update({ where: { id }, data: { ...(input.name ? { name: input.name.trim(), slug: await uniqueTaxonomySlug(input.name, "tag", id) } : {}), updatedById: actorId }, include: { _count: { select: { posts: true } } } });
}

export async function deleteTag(id: string, actorId: string) {
  const existing = await prisma.postTag.findFirst({ where: { id, isDeleted: false } });
  if (!existing) throw new AppError("El tag no existe o ya fue eliminado.", 404, "TAG_NOT_FOUND");
  await prisma.$transaction([prisma.postTagRelation.deleteMany({ where: { tagId: id } }), prisma.postTag.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date(), deletedById: actorId, updatedById: actorId } })]);
  return { id };
}
