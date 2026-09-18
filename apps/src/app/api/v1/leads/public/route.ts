import { createPublicLead } from "@/server/modules/leads/leads.service";
import { createPublicLeadSchema } from "@/server/modules/leads/leads.schemas";
import { handleRoute, jsonSuccess, parseRequest } from "@/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const parsed = await parseRequest(createPublicLeadSchema, request);
    const result = await createPublicLead(parsed.body);
    return jsonSuccess("Mensaje recibido correctamente.", result, 201);
  });
}
