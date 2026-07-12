import { z } from "zod";

const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const coverImageSchema = z
  .object({
    fileName: z.string().min(1),
    mimeType: z.string().min(1),
    dataBase64: z.string().min(1)
  })
  .optional()
  .nullable();

export const listPostsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: postStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const postParamsSchema = z.object({
  params: z.object({
    postId: z.string().uuid("El identificador de la publicacion no es valido.")
  })
});

export const publicPostParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1)
  })
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, "El titulo debe tener al menos 3 caracteres."),
    excerpt: z.string().optional().nullable(),
    content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
    status: postStatusSchema.default("DRAFT"),
    coverImage: coverImageSchema
  })
});

export const updatePostSchema = postParamsSchema.extend({
  body: createPostSchema.shape.body.partial()
});

export type ListPostsInput = z.infer<typeof listPostsSchema>["query"];
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
