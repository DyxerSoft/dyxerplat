import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createTag, listTags } from "@/server/modules/posts/posts.service";
import { taxonomySchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.POSTS_READ);
    const result = await listTags();
    return jsonSuccess("Etiquetas obtenidas correctamente.", result);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_CREATE);
    const parsed = await parseRequest(taxonomySchema, request);
    const result = await createTag(parsed.body, auth.userId);
    return jsonSuccess("Etiqueta creada correctamente.", result, 201);
  });
}
