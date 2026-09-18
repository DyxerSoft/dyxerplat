import { z } from "zod";

export const leadStatusSchema = z.enum(["NEW", "IN_CONTACT", "CLOSED_WON", "CLOSED_LOST"]);

export const createPublicLeadSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    companyName: z.string().min(1, "La empresa es requerida."),
    position: z.string().optional().nullable(),
    email: z.string().email("El correo no es valido."),
    phone: z.string().min(1, "El telefono es requerido."),
    serviceInterest: z.string().min(1, "El servicio es requerido."),
    message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres.")
  })
});

export const listLeadsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: leadStatusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const leadParamsSchema = z.object({
  params: z.object({
    leadId: z.string().uuid("El identificador del lead no es valido.")
  })
});

export const updateLeadSchema = leadParamsSchema.extend({
  body: z.object({
    status: leadStatusSchema.optional(),
    notes: z.string().optional().nullable(),
    fullName: z.string().min(2).optional(),
    companyName: z.string().min(1).optional(),
    position: z.string().optional().nullable(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    serviceInterest: z.string().min(1).optional(),
    message: z.string().min(10).optional()
  })
});

export type CreatePublicLeadInput = z.infer<typeof createPublicLeadSchema>["body"];
export type ListLeadsInput = z.infer<typeof listLeadsSchema>["query"];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>["body"];
