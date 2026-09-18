import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createPost, listPosts } from "@/server/modules/posts/posts.service";
import { createPostSchema, listPostsSchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.POSTS_READ);
    const parsed = await parseRequest(listPostsSchema, request);
    const result = await listPosts(parsed.query);
    return jsonSuccess("Publicaciones obtenidas correctamente.", result);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.POSTS_CREATE);
    const parsed = await parseRequest(createPostSchema, request);
    const result = await createPost(parsed.body, auth.userId);
    return jsonSuccess("Publicacion creada correctamente.", result, 201);
  });
}
