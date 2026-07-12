import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Los datos enviados no son validos.",
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

  return res.status(500).json({
    success: false,
    message: "Ocurrio un error inesperado en el servidor.",
    code: "INTERNAL_SERVER_ERROR",
    details: null
  });
};
