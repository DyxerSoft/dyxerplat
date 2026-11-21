import { listCatalogProducts } from "@/server/modules/products/products.service";
import { handleRoute, jsonSuccess } from "@/server/http";

export const runtime = "nodejs";
export async function GET() {
  return handleRoute(async () => jsonSuccess("Productos públicos obtenidos.", await listCatalogProducts(true)));
}
