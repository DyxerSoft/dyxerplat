import type { Response } from "express";

type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export function sendSuccess<T>(res: Response, message: string, data: T, statusCode = 200) {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    data
  };

  return res.status(statusCode).json(body);
}
