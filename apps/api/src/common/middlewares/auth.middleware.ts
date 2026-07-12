import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { AppError } from "../errors/AppError";

type JwtSessionPayload = {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
};

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      userId: string;
      email: string;
      roles: string[];
      permissions: string[];
    };
  }
}

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtSessionPayload;

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isDeleted: false,
        status: "ACTIVE"
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new AppError("La sesion no es valida o el usuario esta inactivo.", 401, "INVALID_SESSION");
    }

    req.auth = {
      userId: user.id,
      email: user.email,
      roles: user.userRoles.map((userRole) => userRole.role.code),
      permissions: Array.from(
        new Set(
          user.userRoles.flatMap((userRole) =>
            userRole.role.permissions.map((rolePermission) => rolePermission.permission.code)
          )
        )
      )
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError("Tu sesion expiro o no es valida.", 401, "INVALID_TOKEN"));
  }
};
