import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { deleteLead, updateLead } from "@/server/modules/leads/leads.service";
import { leadParamsSchema, updateLeadSchema } from "@/server/modules/leads/leads.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ leadId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.LEADS_UPDATE);
    const routeParams = await context.params;
    const parsed = await parseRequest(updateLeadSchema, request, routeParams);
    const result = await updateLead(parsed.params.leadId, parsed.body, auth.userId);
    return jsonSuccess("Lead actualizado correctamente.", result);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const auth = await requirePermission(request, PERMISSIONS.LEADS_DELETE);
    const routeParams = await context.params;
    const parsed = await parseRequest(leadParamsSchema, request, routeParams);
    const result = await deleteLead(parsed.params.leadId, auth.userId);
    return jsonSuccess("Lead eliminado correctamente.", result);
  });
}
