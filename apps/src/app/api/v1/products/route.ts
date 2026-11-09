import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createCatalogProduct, listCatalogProducts } from "@/server/modules/products/products.service";
import { createProductSchema } from "@/server/modules/products/products.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";
export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.PRODUCTS_READ);
    return jsonSuccess("Productos obtenidos correctamente.", await listCatalogProducts());
  });
}
export async function POST(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.PRODUCTS_MANAGE);
    const parsed = await parseRequest(createProductSchema, request);
    return jsonSuccess("Producto creado correctamente.", await createCatalogProduct(parsed.body), 201);
  });
}
