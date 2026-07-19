import { z } from "zod";

const postStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const coverImageSchema = z
  .object({
    fileName: z.string().min(1),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"], { errorMap: () => ({ message: "La portada debe ser JPG, PNG o WEBP." }) }),
    dataBase64: z.string().min(1)
  })
  .optional()
  .nullable();

const taxonomyBodySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80, "El nombre no puede superar 80 caracteres.")
});

export const taxonomyParamsSchema = z.object({ params: z.object({ taxonomyId: z.string().uuid("El identificador no es válido.") }) });
export const createTaxonomySchema = z.object({ body: taxonomyBodySchema });
export const updateTaxonomySchema = taxonomyParamsSchema.extend({ body: taxonomyBodySchema.partial() });

export const listPostsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: postStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const listPublicPostsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(24).default(9)
  })
});
export type ListPublicPostsInput = z.infer<typeof listPublicPostsSchema>["query"];

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
    coverImage: coverImageSchema,
    categoryId: z.string().uuid("La categoría seleccionada no es válida.").optional().nullable().or(z.literal("")),
    tagIds: z.array(z.string().uuid("Uno de los tags no es válido.")).max(10, "Puedes seleccionar hasta 10 tags.").default([])
  })
});

export const updatePostSchema = postParamsSchema.extend({
  body: createPostSchema.shape.body.partial()
});

export type ListPostsInput = z.infer<typeof listPostsSchema>["query"];
export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
