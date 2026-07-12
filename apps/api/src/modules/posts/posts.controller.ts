import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import {
  createCategory,
  createPost,
  createTag,
  deleteCategory,
  deletePost,
  deleteTag,
  getPublishedPost,
  listCategories,
  listPosts,
  listPublishedPosts,
  listTags,
  updateCategory,
  updatePost,
  updateTag
} from "./posts.service";

function getActorId(req: Request) {
  if (!req.auth?.userId) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  return req.auth.userId;
}

export async function listPostsController(req: Request, res: Response) {
  const result = await listPosts(req.query as never);
  return sendSuccess(res, "Publicaciones obtenidas correctamente.", result);
}

export async function listPublishedPostsController(_req: Request, res: Response) {
  const result = await listPublishedPosts();
  return sendSuccess(res, "Publicaciones publicas obtenidas correctamente.", result);
}

export async function getPublishedPostController(req: Request, res: Response) {
  const result = await getPublishedPost(req.params.slug);
  return sendSuccess(res, "Publicacion obtenida correctamente.", result);
}

export async function createPostController(req: Request, res: Response) {
  const result = await createPost(req.body, getActorId(req));
  return sendSuccess(res, "Publicacion creada correctamente.", result, 201);
}

export async function updatePostController(req: Request, res: Response) {
  const result = await updatePost(req.params.postId, req.body, getActorId(req));
  return sendSuccess(res, "Publicacion actualizada correctamente.", result);
}

export async function deletePostController(req: Request, res: Response) {
  const result = await deletePost(req.params.postId, getActorId(req));
  return sendSuccess(res, "Publicacion eliminada correctamente.", result);
}

export async function listCategoriesController(_req: Request, res: Response) {
  return sendSuccess(res, "Categorias obtenidas correctamente.", await listCategories());
}

export async function createCategoryController(req: Request, res: Response) {
  return sendSuccess(res, "Categoria creada correctamente.", await createCategory(req.body, getActorId(req)), 201);
}

export async function updateCategoryController(req: Request, res: Response) {
  return sendSuccess(res, "Categoria actualizada correctamente.", await updateCategory(req.params.categoryId, req.body, getActorId(req)));
}

export async function deleteCategoryController(req: Request, res: Response) {
  return sendSuccess(res, "Categoria eliminada correctamente.", await deleteCategory(req.params.categoryId, getActorId(req)));
}

export async function listTagsController(_req: Request, res: Response) {
  return sendSuccess(res, "Etiquetas obtenidas correctamente.", await listTags());
}

export async function createTagController(req: Request, res: Response) {
  return sendSuccess(res, "Etiqueta creada correctamente.", await createTag(req.body, getActorId(req)), 201);
}

export async function updateTagController(req: Request, res: Response) {
  return sendSuccess(res, "Etiqueta actualizada correctamente.", await updateTag(req.params.tagId, req.body, getActorId(req)));
}

export async function deleteTagController(req: Request, res: Response) {
  return sendSuccess(res, "Etiqueta eliminada correctamente.", await deleteTag(req.params.tagId, getActorId(req)));
}
