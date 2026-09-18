import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";

const mediaParamsSchema = z.object({
  mediaId: z.string().uuid()
});

export async function getMediaController(req: Request, res: Response) {
  const { mediaId } = mediaParamsSchema.parse(req.params);
  const media = await prisma.mediaFile.findFirst({
    where: {
      id: mediaId,
      isDeleted: false
    }
  });

  if (!media) {
    throw new AppError("El archivo no existe o fue eliminado.", 404, "MEDIA_NOT_FOUND");
  }

  res.setHeader("Content-Type", media.mimeType);
  res.setHeader("Content-Length", media.size);
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  return res.send(Buffer.from(media.data));
}
