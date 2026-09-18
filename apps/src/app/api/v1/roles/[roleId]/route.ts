import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteRole, updateRole } from "@/server/modules/roles/roles.service";
import { roleParamsSchema, updateRoleSchema } from "@/server/modules/roles/roles.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ roleId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.ROLES_MANAGE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updateRoleSchema, request, routeParams);
    const result = await updateRole(parsed.params.roleId, parsed.body, auth.userId);
    return jsonSuccess("Rol actualizado correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.ROLES_MANAGE);
    const routeParams = await context.params;
    const parsed = await parseRequest(roleParamsSchema, request, routeParams);
    const result = await deleteRole(parsed.params.roleId, auth.userId);
    return jsonSuccess("Rol eliminado correctamente.", result);
  });
}
