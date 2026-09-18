import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: statusSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const userParamsSchema = z.object({
  params: z.object({
    userId: z.string().uuid("El identificador del usuario no es valido.")
  })
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email("El correo no es valido."),
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres."),
    phone: z.string().optional().nullable(),
    documentNumber: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
    status: statusSchema.default("ACTIVE"),
    roleIds: z.array(z.string().uuid()).default([])
  })
});

export const updateUserSchema = userParamsSchema.extend({
  body: createUserSchema.shape.body.omit({ password: true }).partial().extend({
    password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.").optional().or(z.literal(""))
  })
});

export type ListUsersInput = z.infer<typeof listUsersSchema>["query"];
export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
