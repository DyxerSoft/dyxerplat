import { Router } from "express";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { validateRequest } from "../../common/middlewares/validate-request";
import { loginController, meController } from "./auth.controller";
import { loginSchema } from "./auth.schemas";

export const authRoutes = Router();

authRoutes.post("/login", validateRequest(loginSchema), asyncHandler(loginController));
authRoutes.get("/me", authenticate, asyncHandler(meController));
