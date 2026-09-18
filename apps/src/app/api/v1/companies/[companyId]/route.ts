import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteCompany, updateCompany } from "@/server/modules/companies/companies.service";
import { companyParamsSchema, updateCompanySchema } from "@/server/modules/companies/companies.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companyId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.COMPANIES_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updateCompanySchema, request, routeParams);
    const result = await updateCompany(parsed.params.companyId, parsed.body, auth.userId);
    return jsonSuccess("Compania actualizada correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.COMPANIES_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(companyParamsSchema, request, routeParams);
    const result = await deleteCompany(parsed.params.companyId, auth.userId);
    return jsonSuccess("Compania eliminada correctamente.", result);
  });
}
