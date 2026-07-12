import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import type { LoginInput } from "./auth.schemas";

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email.toLowerCase(),
      isDeleted: false
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
    throw new AppError("Correo o contrasena incorrectos.", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new AppError("Tu usuario no esta activo. Contacta a un administrador.", 403, "USER_INACTIVE");
  }

  const passwordIsValid = await argon2.verify(user.passwordHash, input.password);

  if (!passwordIsValid) {
    throw new AppError("Correo o contrasena incorrectos.", 401, "INVALID_CREDENTIALS");
  }

  const roles = user.userRoles.map((userRole) => userRole.role.code);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.code)
      )
    )
  );

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles,
      permissions
    },
    env.JWT_SECRET,
    signOptions
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date()
    }
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
      roles,
      permissions
    }
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
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

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    mustChangePassword: user.mustChangePassword,
    roles: user.userRoles.map((userRole) => userRole.role.code),
    permissions: Array.from(
      new Set(
        user.userRoles.flatMap((userRole) =>
          userRole.role.permissions.map((rolePermission) => rolePermission.permission.code)
        )
      )
    )
  };
}
