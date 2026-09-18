import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createUser, listUsers } from "@/server/modules/users/users.service";
import { createUserSchema, listUsersSchema } from "@/server/modules/users/users.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.USERS_READ);
    const parsed = await parseRequest(listUsersSchema, request);
    const result = await listUsers(parsed.query);
    return jsonSuccess("Usuarios obtenidos correctamente.", result);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.USERS_CREATE);
    const parsed = await parseRequest(createUserSchema, request);
    const result = await createUser(parsed.body, auth.userId);
    return jsonSuccess("Usuario creado correctamente.", result, 201);
  });
}
