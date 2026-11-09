import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteCatalogProduct, updateCatalogProduct } from "@/server/modules/products/products.service";
import { productParamsSchema, updateProductSchema } from "@/server/modules/products/products.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";
export async function PUT(request: Request, context: { params: Promise<{ productId: string }> }) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.PRODUCTS_MANAGE);
    const params = await context.params;
    const parsed = await parseRequest(updateProductSchema, request, { params });
    return jsonSuccess("Producto actualizado correctamente.", await updateCatalogProduct(parsed.params.productId, parsed.body));
  });
}
export async function DELETE(request: Request, context: { params: Promise<{ productId: string }> }) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.PRODUCTS_MANAGE);
    const { params } = await parseRequest(productParamsSchema, request, { params: await context.params });
    return jsonSuccess("Producto eliminado correctamente.", await deleteCatalogProduct(params.productId));
  });
}
