import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError";

export function requirePermission(permission: string): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED"));
      return;
    }

    if (!req.auth.permissions.includes(permission)) {
      next(new AppError("No tienes permiso para realizar esta accion.", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
}
