import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteUser, updateUser } from "@/server/modules/users/users.service";
import { updateUserSchema, userParamsSchema } from "@/server/modules/users/users.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.USERS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updateUserSchema, request, routeParams);
    const result = await updateUser(parsed.params.userId, parsed.body, auth.userId);
    return jsonSuccess("Usuario actualizado correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.USERS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(userParamsSchema, request, routeParams);
    const result = await deleteUser(parsed.params.userId, auth.userId);
    return jsonSuccess("Usuario eliminado correctamente.", result);
  });
}
