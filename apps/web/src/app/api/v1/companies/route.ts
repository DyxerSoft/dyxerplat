import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createCompany, listCompanies } from "@/server/modules/companies/companies.service";
import { createCompanySchema, listCompaniesSchema } from "@/server/modules/companies/companies.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.COMPANIES_READ);
    const parsed = await parseRequest(listCompaniesSchema, request);
    const result = await listCompanies(parsed.query);
    return jsonSuccess("Companias obtenidas correctamente.", result);
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.COMPANIES_CREATE);
    const parsed = await parseRequest(createCompanySchema, request);
    const result = await createCompany(parsed.body, auth.userId);
    return jsonSuccess("Compania creada correctamente.", result, 201);
  });
}
