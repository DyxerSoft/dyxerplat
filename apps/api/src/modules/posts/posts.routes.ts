import { Router } from "express";
import { PERMISSIONS } from "@dyxerplat/shared";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  createCategoryController,
  createPostController,
  createTagController,
  deleteCategoryController,
  deletePostController,
  deleteTagController,
  getPublishedPostController,
  listCategoriesController,
  listPostsController,
  listPublishedPostsController,
  listTagsController,
  updateCategoryController,
  updatePostController,
  updateTagController
} from "./posts.controller";
import {
  categoryParamsSchema,
  createPostSchema,
  listPostsSchema,
  postParamsSchema,
  publicPostParamsSchema,
  tagParamsSchema,
  taxonomySchema,
  updatePostSchema
} from "./posts.schemas";

export const postsRoutes = Router();

postsRoutes.get("/public", asyncHandler(listPublishedPostsController));
postsRoutes.get("/public/:slug", validateRequest(publicPostParamsSchema), asyncHandler(getPublishedPostController));

postsRoutes.use(authenticate);

postsRoutes.get("/categories", requirePermission(PERMISSIONS.POSTS_READ), asyncHandler(listCategoriesController));
postsRoutes.post("/categories", requirePermission(PERMISSIONS.POSTS_CREATE), validateRequest(taxonomySchema), asyncHandler(createCategoryController));
postsRoutes.put("/categories/:categoryId", requirePermission(PERMISSIONS.POSTS_UPDATE), validateRequest(categoryParamsSchema.merge(taxonomySchema)), asyncHandler(updateCategoryController));
postsRoutes.delete("/categories/:categoryId", requirePermission(PERMISSIONS.POSTS_DELETE), validateRequest(categoryParamsSchema), asyncHandler(deleteCategoryController));

postsRoutes.get("/tags", requirePermission(PERMISSIONS.POSTS_READ), asyncHandler(listTagsController));
postsRoutes.post("/tags", requirePermission(PERMISSIONS.POSTS_CREATE), validateRequest(taxonomySchema), asyncHandler(createTagController));
postsRoutes.put("/tags/:tagId", requirePermission(PERMISSIONS.POSTS_UPDATE), validateRequest(tagParamsSchema.merge(taxonomySchema)), asyncHandler(updateTagController));
postsRoutes.delete("/tags/:tagId", requirePermission(PERMISSIONS.POSTS_DELETE), validateRequest(tagParamsSchema), asyncHandler(deleteTagController));

postsRoutes.get("/", requirePermission(PERMISSIONS.POSTS_READ), validateRequest(listPostsSchema), asyncHandler(listPostsController));
postsRoutes.post("/", requirePermission(PERMISSIONS.POSTS_CREATE), validateRequest(createPostSchema), asyncHandler(createPostController));
postsRoutes.put("/:postId", requirePermission(PERMISSIONS.POSTS_UPDATE), validateRequest(updatePostSchema), asyncHandler(updatePostController));
postsRoutes.delete("/:postId", requirePermission(PERMISSIONS.POSTS_DELETE), validateRequest(postParamsSchema), asyncHandler(deletePostController));
