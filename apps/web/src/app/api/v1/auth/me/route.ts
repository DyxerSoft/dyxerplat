import { authenticate } from "@/server/auth";
import { getCurrentUser } from "@/server/modules/auth/auth.service";
import { handleRoute, jsonSuccess } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const auth = await authenticate(request);
    const result = await getCurrentUser(auth.userId);
    return jsonSuccess("Sesion activa.", result);
  });
}
