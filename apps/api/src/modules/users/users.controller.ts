import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import { createUser, deleteUser, listUsers, updateUser } from "./users.service";

function getActorId(req: Request) {
  if (!req.auth?.userId) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }
  return req.auth.userId;
}

export async function listUsersController(req: Request, res: Response) {
  return sendSuccess(res, "Usuarios obtenidos correctamente.", await listUsers(req.query as never));
}

export async function createUserController(req: Request, res: Response) {
  return sendSuccess(res, "Usuario creado correctamente.", await createUser(req.body, getActorId(req)), 201);
}

export async function updateUserController(req: Request, res: Response) {
  return sendSuccess(res, "Usuario actualizado correctamente.", await updateUser(req.params.userId, req.body, getActorId(req)));
}

export async function deleteUserController(req: Request, res: Response) {
  return sendSuccess(res, "Usuario eliminado correctamente.", await deleteUser(req.params.userId, getActorId(req)));
}
