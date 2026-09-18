import { handleRoute, jsonSuccess } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  return handleRoute(async () =>
    jsonSuccess("API Dyxerplat operativa.", {
      status: "ok"
    })
  );
}
