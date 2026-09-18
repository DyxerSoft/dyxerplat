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
  , createCategoryController, createTagController, deleteCategoryController, deleteTagController, listCategoriesController, listTagsController, updateCategoryController, updateTagController
} from "./posts.controller";
import { createPostSchema, createTaxonomySchema, listPostsSchema, listPublicPostsSchema, postParamsSchema, publicPostParamsSchema, taxonomyParamsSchema, updatePostSchema, updateTaxonomySchema } from "./posts.schemas";

export const postsRoutes = Router();

postsRoutes.get("/public", validateRequest(listPublicPostsSchema), asyncHandler(listPublishedPostsController));
postsRoutes.get("/public/:slug", validateRequest(publicPostParamsSchema), asyncHandler(getPublishedPostController));

postsRoutes.use(authenticate);

postsRoutes.get("/categories", requirePermission(PERMISSIONS.CATEGORIES_READ), asyncHandler(listCategoriesController));
postsRoutes.post("/categories", requirePermission(PERMISSIONS.CATEGORIES_CREATE), validateRequest(createTaxonomySchema), asyncHandler(createCategoryController));
postsRoutes.put("/categories/:taxonomyId", requirePermission(PERMISSIONS.CATEGORIES_UPDATE), validateRequest(updateTaxonomySchema), asyncHandler(updateCategoryController));
postsRoutes.delete("/categories/:taxonomyId", requirePermission(PERMISSIONS.CATEGORIES_DELETE), validateRequest(taxonomyParamsSchema), asyncHandler(deleteCategoryController));
postsRoutes.get("/tags", requirePermission(PERMISSIONS.TAGS_READ), asyncHandler(listTagsController));
postsRoutes.post("/tags", requirePermission(PERMISSIONS.TAGS_CREATE), validateRequest(createTaxonomySchema), asyncHandler(createTagController));
postsRoutes.put("/tags/:taxonomyId", requirePermission(PERMISSIONS.TAGS_UPDATE), validateRequest(updateTaxonomySchema), asyncHandler(updateTagController));
postsRoutes.delete("/tags/:taxonomyId", requirePermission(PERMISSIONS.TAGS_DELETE), validateRequest(taxonomyParamsSchema), asyncHandler(deleteTagController));

postsRoutes.get("/", requirePermission(PERMISSIONS.POSTS_READ), validateRequest(listPostsSchema), asyncHandler(listPostsController));
postsRoutes.post("/", requirePermission(PERMISSIONS.POSTS_CREATE), validateRequest(createPostSchema), asyncHandler(createPostController));
postsRoutes.put("/:postId", requirePermission(PERMISSIONS.POSTS_UPDATE), validateRequest(updatePostSchema), asyncHandler(updatePostController));
postsRoutes.delete("/:postId", requirePermission(PERMISSIONS.POSTS_DELETE), validateRequest(postParamsSchema), asyncHandler(deletePostController));
