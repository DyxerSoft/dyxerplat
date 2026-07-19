import { z } from "zod";

export const listRolesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    type: z.enum(["SYSTEM", "CUSTOM"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(10)
  })
});

export const roleParamsSchema = z.object({
  params: z.object({
    roleId: z.string().uuid("El identificador del rol no es valido.")
  })
});

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    code: z.string().min(2, "El codigo debe tener al menos 2 caracteres."),
    description: z.string().optional().nullable(),
    permissionCodes: z.array(z.string()).default([])
  })
});

export const updateRoleSchema = roleParamsSchema.extend({
  body: createRoleSchema.shape.body.partial()
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>["body"];
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>["body"];
export type ListRolesInput = z.infer<typeof listRolesSchema>["query"];
