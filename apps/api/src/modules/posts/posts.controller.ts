import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { PERMISSIONS } from "../../common/constants/permissions";
import { sendSuccess } from "../../common/responses/api-response";
import { createPost, deletePost, getPublishedPost, listPosts, listPublishedPosts, updatePost } from "./posts.service";
import { createCategory, createTag, deleteCategory, deleteTag, listCategories, listTags, updateCategory, updateTag } from "./posts.service";

function getActorId(req: Request) {
  if (!req.auth?.userId) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  return req.auth.userId;
}

function assertCanPublish(req: Request) {
  if (req.body.status === "PUBLISHED" && !req.auth?.permissions.includes(PERMISSIONS.POSTS_PUBLISH)) {
    throw new AppError("No tienes permiso para publicar contenido. Puedes guardarlo como borrador.", 403, "POST_PUBLISH_FORBIDDEN");
  }
}

export async function listPostsController(req: Request, res: Response) {
  const result = await listPosts(req.query as never);
  return sendSuccess(res, "Publicaciones obtenidas correctamente.", result);
}

export async function listPublishedPostsController(req: Request, res: Response) {
  const result = await listPublishedPosts(req.query as never);
  return sendSuccess(res, "Publicaciones publicas obtenidas correctamente.", result);
}

export async function getPublishedPostController(req: Request, res: Response) {
  const result = await getPublishedPost(req.params.slug);
  return sendSuccess(res, "Publicacion obtenida correctamente.", result);
}

export async function createPostController(req: Request, res: Response) {
  assertCanPublish(req);
  const result = await createPost(req.body, getActorId(req));
  return sendSuccess(res, "Publicacion creada correctamente.", result, 201);
}

export async function updatePostController(req: Request, res: Response) {
  assertCanPublish(req);
  const result = await updatePost(req.params.postId, req.body, getActorId(req));
  return sendSuccess(res, "Publicacion actualizada correctamente.", result);
}

export async function deletePostController(req: Request, res: Response) {
  const result = await deletePost(req.params.postId, getActorId(req));
  return sendSuccess(res, "Publicacion eliminada correctamente.", result);
}

export async function listCategoriesController(_req: Request, res: Response) { return sendSuccess(res, "Categorías obtenidas correctamente.", await listCategories()); }
export async function createCategoryController(req: Request, res: Response) { return sendSuccess(res, "Categoría creada correctamente.", await createCategory(req.body, getActorId(req)), 201); }
export async function updateCategoryController(req: Request, res: Response) { return sendSuccess(res, "Categoría actualizada correctamente.", await updateCategory(req.params.taxonomyId, req.body, getActorId(req))); }
export async function deleteCategoryController(req: Request, res: Response) { return sendSuccess(res, "Categoría eliminada correctamente.", await deleteCategory(req.params.taxonomyId, getActorId(req))); }
export async function listTagsController(_req: Request, res: Response) { return sendSuccess(res, "Tags obtenidos correctamente.", await listTags()); }
export async function createTagController(req: Request, res: Response) { return sendSuccess(res, "Tag creado correctamente.", await createTag(req.body, getActorId(req)), 201); }
export async function updateTagController(req: Request, res: Response) { return sendSuccess(res, "Tag actualizado correctamente.", await updateTag(req.params.taxonomyId, req.body, getActorId(req))); }
export async function deleteTagController(req: Request, res: Response) { return sendSuccess(res, "Tag eliminado correctamente.", await deleteTag(req.params.taxonomyId, getActorId(req))); }
