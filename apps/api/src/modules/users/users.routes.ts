import { Router } from "express";
import { PERMISSIONS } from "@dyxerplat/shared";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createUserController, deleteUserController, listUsersController, updateUserController } from "./users.controller";
import { createUserSchema, listUsersSchema, updateUserSchema, userParamsSchema } from "./users.schemas";

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get("/", requirePermission(PERMISSIONS.USERS_READ), validateRequest(listUsersSchema), asyncHandler(listUsersController));
usersRoutes.post("/", requirePermission(PERMISSIONS.USERS_CREATE), validateRequest(createUserSchema), asyncHandler(createUserController));
usersRoutes.put("/:userId", requirePermission(PERMISSIONS.USERS_UPDATE), validateRequest(updateUserSchema), asyncHandler(updateUserController));
usersRoutes.delete("/:userId", requirePermission(PERMISSIONS.USERS_DELETE), validateRequest(userParamsSchema), asyncHandler(deleteUserController));
