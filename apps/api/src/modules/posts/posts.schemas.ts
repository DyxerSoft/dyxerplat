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

export const categoryParamsSchema = z.object({
  params: z.object({
    categoryId: z.string().uuid("El identificador de la categoria no es valido.")
  })
});

export const tagParamsSchema = z.object({
  params: z.object({
    tagId: z.string().uuid("El identificador de la etiqueta no es valido.")
  })
});

export const taxonomySchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres.")
  })
});

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, "El titulo debe tener al menos 3 caracteres."),
    excerpt: z.string().optional().nullable(),
    content: z.string().min(10, "El contenido debe tener al menos 10 caracteres."),
    status: postStatusSchema.default("DRAFT"),
    coverImage: coverImageSchema,
    categoryId: z.string().uuid("La categoria no es valida.").optional().nullable(),
    tagIds: z.array(z.string().uuid("Una etiqueta no es valida.")).default([])
  })
});

export const updatePostSchema = postParamsSchema.extend({
  body: createPostSchema.shape.body.partial()
});

export type ListPostsInput = z.infer<typeof listPostsSchema>["query"];
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type TaxonomyInput = z.infer<typeof taxonomySchema>["body"];
