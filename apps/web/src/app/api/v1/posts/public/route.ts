import { listPublishedPosts } from "@/server/modules/posts/posts.service";
import { handleRoute, jsonSuccess } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () => {
    const result = await listPublishedPosts();
    return jsonSuccess("Publicaciones publicas obtenidas correctamente.", result);
  });
}
