import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteTag, updateTag } from "@/server/modules/posts/posts.service";
import { tagParamsSchema, taxonomySchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ tagId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(tagParamsSchema.merge(taxonomySchema), request, routeParams);
    const result = await updateTag(parsed.params.tagId, parsed.body, auth.userId);
    return jsonSuccess("Etiqueta actualizada correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(tagParamsSchema, request, routeParams);
    const result = await deleteTag(parsed.params.tagId, auth.userId);
    return jsonSuccess("Etiqueta eliminada correctamente.", result);
  });
}
