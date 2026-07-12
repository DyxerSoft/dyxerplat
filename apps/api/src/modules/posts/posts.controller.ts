import type { Request, Response } from "express";
import { AppError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/responses/api-response";
import { createPost, deletePost, getPublishedPost, listPosts, listPublishedPosts, updatePost } from "./posts.service";

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
