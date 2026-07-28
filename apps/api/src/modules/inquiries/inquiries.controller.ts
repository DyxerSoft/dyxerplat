import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import { createInquiry, deleteInquiry, listInquiries, updateInquiry } from "./inquiries.service";

function actorId(req: Request) {
  if (!req.auth?.userId) throw new AppError("Debes iniciar sesión para continuar.", 401, "UNAUTHENTICATED");
  return req.auth.userId;
}

export async function createInquiryController(req: Request, res: Response) {
  const inquiry = await createInquiry(req.body);
  return sendSuccess(res, "Recibimos tu mensaje. Te contactaremos pronto.", { id: inquiry.id }, 201);
}
export async function listInquiriesController(req: Request, res: Response) {
  return sendSuccess(res, "Solicitudes obtenidas correctamente.", await listInquiries(req.query as never));
}
export async function updateInquiryController(req: Request, res: Response) {
  return sendSuccess(res, "Solicitud actualizada correctamente.", await updateInquiry(req.params.inquiryId, req.body, actorId(req)));
}
export async function deleteInquiryController(req: Request, res: Response) {
  return sendSuccess(res, "Solicitud eliminada correctamente.", await deleteInquiry(req.params.inquiryId, actorId(req)));
}
