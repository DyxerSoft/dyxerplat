import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteCompanyContact, updateCompanyContact } from "@/server/modules/companies/companies.service";
import { contactParamsSchema, updateContactSchema } from "@/server/modules/companies/companies.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ companyId: string; contactId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.CONTACTS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updateContactSchema, request, routeParams);
    const result = await updateCompanyContact(
      parsed.params.companyId,
      parsed.params.contactId,
      parsed.body,
      auth.userId
    );
    return jsonSuccess("Contacto actualizado correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.CONTACTS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(contactParamsSchema, request, routeParams);
    const result = await deleteCompanyContact(parsed.params.companyId, parsed.params.contactId, auth.userId);
    return jsonSuccess("Contacto eliminado correctamente.", result);
  });
}
