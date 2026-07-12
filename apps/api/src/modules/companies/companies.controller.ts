import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import {
  createCompany,
  createCompanyContact,
  deleteCompany,
  deleteCompanyContact,
  listCompanies,
  listCompanyContacts,
  updateCompany,
  updateCompanyContact
} from "./companies.service";

function getActorId(req: Request) {
  if (!req.auth?.userId) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  return req.auth.userId;
}

export async function listCompaniesController(req: Request, res: Response) {
  const result = await listCompanies(req.query as never);
  return sendSuccess(res, "Companias obtenidas correctamente.", result);
}

export async function createCompanyController(req: Request, res: Response) {
  const result = await createCompany(req.body, getActorId(req));
  return sendSuccess(res, "Compania creada correctamente.", result, 201);
}

export async function updateCompanyController(req: Request, res: Response) {
  const result = await updateCompany(req.params.companyId, req.body, getActorId(req));
  return sendSuccess(res, "Compania actualizada correctamente.", result);
}

export async function deleteCompanyController(req: Request, res: Response) {
  const result = await deleteCompany(req.params.companyId, getActorId(req));
  return sendSuccess(res, "Compania eliminada correctamente.", result);
}

export async function listCompanyContactsController(req: Request, res: Response) {
  const result = await listCompanyContacts(req.params.companyId, req.query as never);
  return sendSuccess(res, "Contactos obtenidos correctamente.", result);
}

export async function createCompanyContactController(req: Request, res: Response) {
  const result = await createCompanyContact(req.params.companyId, req.body, getActorId(req));
  return sendSuccess(res, "Contacto creado correctamente.", result, 201);
}

export async function updateCompanyContactController(req: Request, res: Response) {
  const result = await updateCompanyContact(req.params.companyId, req.params.contactId, req.body, getActorId(req));
  return sendSuccess(res, "Contacto actualizado correctamente.", result);
}

export async function deleteCompanyContactController(req: Request, res: Response) {
  const result = await deleteCompanyContact(req.params.companyId, req.params.contactId, getActorId(req));
  return sendSuccess(res, "Contacto eliminado correctamente.", result);
}
