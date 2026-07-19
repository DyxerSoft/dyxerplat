import { Router } from "express";
import { PERMISSIONS } from "../../common/constants/permissions";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  createPostController,
  deletePostController,
  getPublishedPostController,
  listPostsController,
  listPublishedPostsController,
  updatePostController
} from "./posts.controller";
import { createPostSchema, listPostsSchema, postParamsSchema, publicPostParamsSchema, updatePostSchema } from "./posts.schemas";

export const postsRoutes = Router();

postsRoutes.get("/public", asyncHandler(listPublishedPostsController));
postsRoutes.get("/public/:slug", validateRequest(publicPostParamsSchema), asyncHandler(getPublishedPostController));

postsRoutes.use(authenticate);

postsRoutes.get("/", requirePermission(PERMISSIONS.POSTS_READ), validateRequest(listPostsSchema), asyncHandler(listPostsController));
postsRoutes.post("/", requirePermission(PERMISSIONS.POSTS_CREATE), validateRequest(createPostSchema), asyncHandler(createPostController));
postsRoutes.put("/:postId", requirePermission(PERMISSIONS.POSTS_UPDATE), validateRequest(updatePostSchema), asyncHandler(updatePostController));
postsRoutes.delete("/:postId", requirePermission(PERMISSIONS.POSTS_DELETE), validateRequest(postParamsSchema), asyncHandler(deletePostController));
