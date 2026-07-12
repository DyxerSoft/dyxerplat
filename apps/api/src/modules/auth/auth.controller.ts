import type { Request, Response } from "express";
import { sendSuccess } from "../../common/responses/api-response";
import { login } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  const result = await login(req.body);
  return sendSuccess(res, "Inicio de sesion correcto.", result);
}
