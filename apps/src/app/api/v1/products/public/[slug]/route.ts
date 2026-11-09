import { getPublicProduct } from "@/server/modules/products/products.service";
import { publicProductSlugSchema } from "@/server/modules/products/products.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  return handleRoute(async () => {
    const { params } = await parseRequest(publicProductSlugSchema, request, { params: await context.params });
    return jsonSuccess("Producto público obtenido.", await getPublicProduct(params.slug));
  });
}
