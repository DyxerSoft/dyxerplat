import { z } from "zod";

const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  benefits: z.array(z.string().min(1)).default([]),
  price: z.number().nonnegative(),
  currency: z.string().min(1).default("Bs"),
  additionalInfo: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
    shortDescription: z.string().min(5),
    description: z.string().min(5),
    additionalInfo: z.string().nullable().optional(),
    isActive: z.boolean().default(true),
    plans: z.array(planSchema).default([])
  })
});
export const updateProductSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
  body: createProductSchema.shape.body
});
export const productParamsSchema = z.object({ params: z.object({ productId: z.string().uuid() }) });
export const publicProductSlugSchema = z.object({ params: z.object({ slug: z.string().min(1) }) });
export type ProductInput = z.infer<typeof createProductSchema>["body"];
