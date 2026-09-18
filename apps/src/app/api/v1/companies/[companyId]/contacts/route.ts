import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { createCompanyContact, listCompanyContacts } from "@/server/modules/companies/companies.service";
import { createContactSchema, listContactsSchema } from "@/server/modules/companies/companies.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companyId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.CONTACTS_READ);
    const routeParams = await context.params;
    const parsed = await parseRequest(listContactsSchema, request, routeParams);
    const result = await listCompanyContacts(parsed.params.companyId, parsed.query);
    return jsonSuccess("Contactos obtenidos correctamente.", result);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.CONTACTS_CREATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(createContactSchema, request, routeParams);
    const result = await createCompanyContact(parsed.params.companyId, parsed.body, auth.userId);
    return jsonSuccess("Contacto creado correctamente.", result, 201);
  });
}
