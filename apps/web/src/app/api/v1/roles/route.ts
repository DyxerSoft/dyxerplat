import { PERMISSIONS } from "@dyxerplat/shared";
import { authenticate, requirePermission } from "@/server/auth";
import { createRole, listRoles } from "@/server/modules/roles/roles.service";
import { createRoleSchema } from "@/server/modules/roles/roles.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await authenticate(request);
    const result = await listRoles();
    return jsonSuccess("Roles obtenidos correctamente.", result);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.ROLES_MANAGE);
    const parsed = await parseRequest(createRoleSchema, request);
    const result = await createRole(parsed.body, auth.userId);
    return jsonSuccess("Rol creado correctamente.", result, 201);
  });
}
