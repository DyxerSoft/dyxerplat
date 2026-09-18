import { getPublishedPost } from "@/server/modules/posts/posts.service";
import { publicPostParamsSchema } from "@/server/modules/posts/posts.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const routeParams = await context.params;
    const parsed = await parseRequest(publicPostParamsSchema, request, routeParams);
    const result = await getPublishedPost(parsed.params.slug);
    return jsonSuccess("Publicacion publica obtenida correctamente.", result);
  });
}
