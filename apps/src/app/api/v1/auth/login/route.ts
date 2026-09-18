import { login } from "@/server/modules/auth/auth.service";
import { loginSchema } from "@/server/modules/auth/auth.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = await parseRequest(loginSchema, request);
    const result = await login(parsed.body);
    return jsonSuccess("Inicio de sesion correcto.", result);
  });
}
