import { z } from "zod";

export const inquiryStatusSchema = z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "CLOSED"]);

export const createInquirySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(120),
    company: z.string().trim().min(2, "La empresa debe tener al menos 2 caracteres.").max(160),
    email: z.string().trim().email("El correo electrónico no es válido.").max(180),
    phone: z.string().trim().regex(/^\+?\d{7,15}$/, "El teléfono debe contener entre 7 y 15 dígitos.").optional().or(z.literal("")),
    service: z.string().trim().min(1, "Selecciona un servicio.").max(100),
    message: z.string().trim().min(10, "El mensaje debe tener al menos 10 caracteres.").max(4000)
  })
});

export const listInquiriesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: inquiryStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const inquiryParamsSchema = z.object({
  params: z.object({ inquiryId: z.string().uuid("El identificador de la solicitud no es válido.") })
});

export const updateInquirySchema = inquiryParamsSchema.extend({
  body: z.object({
    status: inquiryStatusSchema,
    notes: z.string().trim().max(4000, "Las notas no pueden superar 4000 caracteres.").optional().nullable()
  })
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>["body"];
export type ListInquiriesInput = z.infer<typeof listInquiriesSchema>["query"];
export type UpdateInquiryInput = z.infer<typeof updateInquirySchema>["body"];
