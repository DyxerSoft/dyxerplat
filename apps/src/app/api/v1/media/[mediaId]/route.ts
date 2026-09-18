import { z } from "zod";
import { prisma } from "@/server/prisma";
import { AppError } from "@/server/common/AppError";
import { jsonError } from "@/server/http";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ mediaId: string }>;
};

const mediaParamsSchema = z.object({
  mediaId: z.string().uuid()
});

export async function GET(_request: Request, context: RouteContext) {
  try {
    const routeParams = await context.params;
    const { mediaId } = mediaParamsSchema.parse(routeParams);

    const media = await prisma.mediaFile.findFirst({
      where: {
        id: mediaId,
        isDeleted: false
      }
    });

    if (!media) {
      throw new AppError("El archivo no existe o fue eliminado.", 404, "MEDIA_NOT_FOUND");
    }

    return new Response(Buffer.from(media.data), {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": String(media.size),
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    return jsonError(error);
  }
}
