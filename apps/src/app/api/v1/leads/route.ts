import { PERMISSIONS } from "@dyxerplat/shared";
import { requirePermission } from "@/server/auth";
import { listLeads } from "@/server/modules/leads/leads.service";
import { listLeadsSchema } from "@/server/modules/leads/leads.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function GET(request: Request) {
  return handleRoute(async () => {
    await requirePermission(request, PERMISSIONS.LEADS_READ);
    const parsed = await parseRequest(listLeadsSchema, request);
    const result = await listLeads(parsed.query);
    return jsonSuccess("Leads obtenidos correctamente.", result);
  });
}
