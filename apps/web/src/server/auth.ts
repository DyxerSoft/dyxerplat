import jwt from "jsonwebtoken";
import { prisma } from "@/server/prisma";
import { env } from "@/server/env";
import { AppError } from "@/server/common/AppError";

export type AuthContext = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type JwtSessionPayload = {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export async function authenticate(request: Request): Promise<AuthContext> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Debes iniciar sesion para continuar.", 401, "UNAUTHENTICATED");
  }

  const token = authorization.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtSessionPayload;

    const user = await prisma.user.findFirst({
      where: {
        id: payload.sub,
        isDeleted: false,
        status: "ACTIVE"
      },
      select: {
        id: true,
        email: true,
        userRoles: {
          select: {
            role: {
              select: {
                code: true,
                permissions: {
                  select: {
                    permission: {
                      select: {
                        code: true
                      }
                    }
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

    return {
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
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Tu sesion expiro o no es valida.", 401, "INVALID_TOKEN");
  }
}

export async function requirePermission(request: Request, permission: string): Promise<AuthContext> {
  const auth = await authenticate(request);

  if (!auth.permissions.includes(permission)) {
    throw new AppError("No tienes permiso para realizar esta accion.", 403, "FORBIDDEN");
  }

  return auth;
}
