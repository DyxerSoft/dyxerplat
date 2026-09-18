import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteCategory, updateCategory } from "@/server/modules/posts/posts.service";
import { categoryParamsSchema, taxonomySchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(categoryParamsSchema.merge(taxonomySchema), request, routeParams);
    const result = await updateCategory(parsed.params.categoryId, parsed.body, auth.userId);
    return jsonSuccess("Categoria actualizada correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(categoryParamsSchema, request, routeParams);
    const result = await deleteCategory(parsed.params.categoryId, auth.userId);
    return jsonSuccess("Categoria eliminada correctamente.", result);
  });
}
