import { z } from "zod";

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
