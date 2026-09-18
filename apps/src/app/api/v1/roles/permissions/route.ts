import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { listPermissions } from "@/server/modules/roles/roles.service";
import { handleRoute, jsonSuccess } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.ROLES_MANAGE);
    const result = await listPermissions();
    return jsonSuccess("Permisos obtenidos correctamente.", result);
  });
}
