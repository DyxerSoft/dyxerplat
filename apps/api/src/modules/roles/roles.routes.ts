import { Router } from "express";
import { PERMISSIONS } from "../../common/constants/permissions";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createRoleController, deleteRoleController, listPermissionsController, listRolesController, updateRoleController } from "./roles.controller";
import { createRoleSchema, roleParamsSchema, updateRoleSchema } from "./roles.schemas";

export const rolesRoutes = Router();

rolesRoutes.use(authenticate);

rolesRoutes.get("/", asyncHandler(listRolesController));
rolesRoutes.get("/permissions", requirePermission(PERMISSIONS.ROLES_MANAGE), asyncHandler(listPermissionsController));
rolesRoutes.post("/", requirePermission(PERMISSIONS.ROLES_MANAGE), validateRequest(createRoleSchema), asyncHandler(createRoleController));
rolesRoutes.put("/:roleId", requirePermission(PERMISSIONS.ROLES_MANAGE), validateRequest(updateRoleSchema), asyncHandler(updateRoleController));
rolesRoutes.delete("/:roleId", requirePermission(PERMISSIONS.ROLES_MANAGE), validateRequest(roleParamsSchema), asyncHandler(deleteRoleController));
