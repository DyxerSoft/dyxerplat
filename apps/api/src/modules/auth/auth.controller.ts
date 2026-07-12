import type { Request, Response } from "express";
import { sendSuccess } from "../../common/responses/api-response";
import { AppError } from "../../common/errors/AppError";
import { getCurrentUser, login } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  const result = await login(req.body);
  return sendSuccess(res, "Inicio de sesion correcto.", result);
}

export async function meController(req: Request, res: Response) {
  if (!req.auth) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  const result = await getCurrentUser(req.auth.userId);
  return sendSuccess(res, "Sesion activa.", result);
}
