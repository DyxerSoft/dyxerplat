import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "@/server/env";
import { prisma } from "@/server/prisma";
import { AppError } from "@/server/common/AppError";
import type { LoginInput } from "./auth.schemas";

const authUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  mustChangePassword: true,
  status: true,
  passwordHash: true,
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
} as const;

function toAuthUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  userRoles: Array<{
    role: {
      code: string;
      permissions: Array<{ permission: { code: string } }>;
    };
  }>;
}) {
  const roles = user.userRoles.map((userRole) => userRole.role.code);
  const permissions = Array.from(
    new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.permissions.map((rolePermission) => rolePermission.permission.code)
      )
    )
  );

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    mustChangePassword: user.mustChangePassword,
    roles,
    permissions
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: {
      email: input.email.toLowerCase(),
      isDeleted: false
    },
    select: authUserSelect
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

  const authUser = toAuthUser(user);

  const signOptions: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: authUser.roles,
      permissions: authUser.permissions
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
    user: authUser
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      isDeleted: false,
      status: "ACTIVE"
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      mustChangePassword: true,
      userRoles: authUserSelect.userRoles
    }
  });

  if (!user) {
    throw new AppError("La sesion no es valida o el usuario esta inactivo.", 401, "INVALID_SESSION");
  }

  return toAuthUser(user);
}
