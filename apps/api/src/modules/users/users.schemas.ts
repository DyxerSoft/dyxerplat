import { z } from "zod";

const statusSchema = z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]);
const personNameSchema = z.string().trim().min(2, "Debe tener al menos 2 letras.")
  .regex(/^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u, "Solo se permiten letras, espacios, apóstrofes y guiones.");
const passwordSchema = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");
const phoneSchema = z.string().regex(/^\+?\d{7,15}$/, "El teléfono debe contener entre 7 y 15 dígitos; solo puede iniciar con +.")
  .optional().nullable().or(z.literal(""));
const documentSchema = z.string().regex(/^[A-Za-z0-9-]{4,20}$/, "El documento debe tener entre 4 y 20 letras, números o guiones.")
  .optional().nullable().or(z.literal(""));
const roleIdsSchema = z.array(z.string().uuid("El rol seleccionado no es válido."))
  .length(1, "Debes seleccionar un rol para el usuario.");

export const listUsersSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    status: statusSchema.optional(),
    roleId: z.string().uuid("El rol seleccionado no es valido.").optional(),
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
    password: passwordSchema,
    firstName: personNameSchema,
    lastName: personNameSchema,
    phone: phoneSchema,
    documentNumber: documentSchema,
    position: z.string().optional().nullable(),
    status: statusSchema.default("ACTIVE"),
    roleIds: roleIdsSchema
  })
});

export const updateUserSchema = userParamsSchema.extend({
  body: createUserSchema.shape.body.omit({ password: true }).partial().extend({
    password: passwordSchema.optional().or(z.literal(""))
  })
});

export type ListUsersInput = z.infer<typeof listUsersSchema>["query"];
export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
