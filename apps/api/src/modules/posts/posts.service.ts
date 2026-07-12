import type { Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import type { CreatePostInput, ListPostsInput, UpdatePostInput } from "./posts.schemas";

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

function toPostResponse(
  post: Prisma.PostGetPayload<{
    include: {
      author: true;
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
      include: { author: true },
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

export async function listPublishedPosts() {
  const posts = await prisma.post.findMany({
    where: {
      isDeleted: false,
      status: "PUBLISHED"
    },
    include: { author: true },
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
    include: { author: true }
  });

  if (!post) {
    throw new AppError("La publicacion no existe o no esta publicada.", 404, "POST_NOT_FOUND");
  }

  return toPostResponse(post);
}

export async function createPost(input: CreatePostInput, actorId: string) {
  const coverImageId = input.coverImage ? await createMedia(input.coverImage, actorId) : null;
  const post = await prisma.post.create({
    data: {
      title: input.title.trim(),
      slug: await buildUniqueSlug(input.title),
      excerpt: input.excerpt?.trim() || null,
      content: input.content,
      status: input.status,
      coverImageId,
      authorId: actorId,
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      createdById: actorId,
      updatedById: actorId
    },
    include: { author: true }
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
  const nextStatus = input.status ?? existing.status;
  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim(), slug: await buildUniqueSlug(input.title, postId) } : {}),
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt?.trim() || null } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(coverImageId !== undefined ? { coverImageId } : {}),
      publishedAt: nextStatus === "PUBLISHED" && !existing.publishedAt ? new Date() : nextStatus !== "PUBLISHED" ? null : existing.publishedAt,
      updatedById: actorId
    },
    include: { author: true }
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
