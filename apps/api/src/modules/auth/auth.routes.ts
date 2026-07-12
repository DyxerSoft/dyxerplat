import { Router } from "express";
import { validateRequest } from "../../common/middlewares/validate-request";
import { loginController } from "./auth.controller";
import { loginSchema } from "./auth.schemas";

export const authRoutes = Router();

authRoutes.post("/login", validateRequest(loginSchema), loginController);
