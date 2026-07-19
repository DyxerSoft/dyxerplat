import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import { createRole, deleteRole, listPermissions, listRoles, updateRole } from "./roles.service";
import type { ListRolesInput } from "./roles.schemas";

function getActorId(req: Request) {
  if (!req.auth?.userId) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  return req.auth.userId;
}

export async function listRolesController(req: Request, res: Response) {
  return sendSuccess(res, "Roles obtenidos correctamente.", await listRoles(req.query as unknown as ListRolesInput));
}

export async function listPermissionsController(_req: Request, res: Response) {
  return sendSuccess(res, "Permisos obtenidos correctamente.", await listPermissions());
}

export async function createRoleController(req: Request, res: Response) {
  return sendSuccess(res, "Rol creado correctamente.", await createRole(req.body, getActorId(req)), 201);
}

export async function updateRoleController(req: Request, res: Response) {
  return sendSuccess(res, "Rol actualizado correctamente.", await updateRole(req.params.roleId, req.body, getActorId(req)));
}

export async function deleteRoleController(req: Request, res: Response) {
  return sendSuccess(res, "Rol eliminado correctamente.", await deleteRole(req.params.roleId, getActorId(req)));
}
