import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const listCompaniesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: statusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const companyParamsSchema = z.object({
  params: z.object({
    companyId: z.string().uuid("El identificador de la compania no es valido.")
  })
});

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    legalName: z.string().optional().nullable(),
    taxId: z.string().optional().nullable(),
    email: z.string().email("El correo no es valido.").optional().or(z.literal("")).nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    website: z.string().url("El sitio web no es valido.").optional().or(z.literal("")).nullable(),
    status: statusSchema.default("ACTIVE"),
    notes: z.string().optional().nullable()
  })
});

export const updateCompanySchema = companyParamsSchema.extend({
  body: createCompanySchema.shape.body.partial()
});

export const listContactsSchema = z.object({
  params: companyParamsSchema.shape.params,
  query: z.object({
    q: z.string().optional(),
    status: statusSchema.optional()
  })
});

export const contactParamsSchema = z.object({
  params: z.object({
    companyId: z.string().uuid("El identificador de la compania no es valido."),
    contactId: z.string().uuid("El identificador del contacto no es valido.")
  })
});

export const createContactSchema = z.object({
  params: companyParamsSchema.shape.params,
  body: z.object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres."),
    email: z.string().email("El correo no es valido.").optional().or(z.literal("")).nullable(),
    phone: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    isPrimary: z.boolean().default(false),
    status: statusSchema.default("ACTIVE"),
    notes: z.string().optional().nullable()
  })
});

export const updateContactSchema = contactParamsSchema.extend({
  body: createContactSchema.shape.body.partial()
});

export type ListCompaniesInput = z.infer<typeof listCompaniesSchema>["query"];
export type CreateCompanyInput = z.infer<typeof createCompanySchema>["body"];
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>["body"];
export type ListContactsInput = z.infer<typeof listContactsSchema>["query"];
export type CreateContactInput = z.infer<typeof createContactSchema>["body"];
export type UpdateContactInput = z.infer<typeof updateContactSchema>["body"];
