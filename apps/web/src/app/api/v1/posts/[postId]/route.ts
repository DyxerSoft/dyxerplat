import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deletePost, updatePost } from "@/server/modules/posts/posts.service";
import { postParamsSchema, updatePostSchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updatePostSchema, request, routeParams);
    const result = await updatePost(parsed.params.postId, parsed.body, auth.userId);
    return jsonSuccess("Publicacion actualizada correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(postParamsSchema, request, routeParams);
    const result = await deletePost(parsed.params.postId, auth.userId);
    return jsonSuccess("Publicacion eliminada correctamente.", result);
  });
}
