import type { ErrorRequestHandler } from "express";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

const fieldLabels: Record<string, string> = {
  name: "Nombre",
  code: "Código",
  description: "Descripción",
  permissionCodes: "Permisos",
  roleIds: "Rol",
  email: "Correo electrónico",
  password: "Contraseña",
  firstName: "Nombre",
  lastName: "Apellido",
  phone: "Teléfono",
  documentNumber: "Documento",
  position: "Cargo",
  status: "Estado"
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const field = String(firstIssue?.path.at(-1) ?? "datos enviados");
    const label = fieldLabels[field] ?? field;
    return res.status(422).json({
      success: false,
      message: firstIssue ? `Revisa el campo «${label}»: ${firstIssue.message}` : "Revisa los datos enviados e inténtalo nuevamente.",
      code: "VALIDATION_ERROR",
      details: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      details: error.details ?? null
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "No se pudo guardar porque ya existe otro registro con el mismo dato único. Revisa el código, correo o nombre ingresado.",
        code: "DUPLICATE_VALUE",
        details: { fields: error.meta?.target ?? null }
      });
    }

    if (error.code === "P2003") {
      return res.status(409).json({
        success: false,
        message: "No se puede completar la operación porque el registro está relacionado con otros datos.",
        code: "RELATED_RECORD_CONFLICT",
        details: null
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "El registro solicitado no existe o ya fue eliminado.",
        code: "RECORD_NOT_FOUND",
        details: null
      });
    }
  }

  const referenceId = randomUUID().split("-")[0].toUpperCase();
  console.error(`[${referenceId}] Error no controlado en ${req.method} ${req.originalUrl}`, error);

  return res.status(500).json({
    success: false,
    message: `No pudimos completar la operación por un error interno. Repórtalo con el código ${referenceId}.`,
    code: "INTERNAL_SERVER_ERROR",
    details: { referenceId }
  });
};
