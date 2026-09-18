import { Router } from "express";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { getMediaController } from "./media.controller";

export const mediaRoutes = Router();

mediaRoutes.get("/:mediaId", asyncHandler(getMediaController));
