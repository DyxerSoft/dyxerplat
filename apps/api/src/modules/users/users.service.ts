import argon2 from "argon2";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import { ROLE_CODES } from "../../common/constants/roles";
import type { CreateUserInput, ListUsersInput, UpdateUserInput } from "./users.schemas";

function cleanOptional(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toUserResponse(
  user: Prisma.UserGetPayload<{
    include: {
      userRoles: {
        include: { role: true };
      };
    };
  }>
) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    documentNumber: user.documentNumber,
    position: user.position,
    status: user.status,
    mustChangePassword: user.mustChangePassword,
    lastLoginAt: user.lastLoginAt,
    roles: user.userRoles.map((item) => ({ id: item.role.id, name: item.role.name, code: item.role.code })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function listUsers(input: ListUsersInput) {
  const where: Prisma.UserWhereInput = {
    isDeleted: false,
    userRoles: {
      none: {
        role: { code: ROLE_CODES.SUPER_ADMIN }
      },
      ...(input.roleId ? { some: { roleId: input.roleId } } : {})
    },
    ...(input.status ? { status: input.status } : {}),
    ...(input.q
      ? {
          OR: [
            { email: { contains: input.q, mode: "insensitive" } },
            { firstName: { contains: input.q, mode: "insensitive" } },
            { lastName: { contains: input.q, mode: "insensitive" } },
            { documentNumber: { contains: input.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const skip = (input.page - 1) * input.pageSize;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { userRoles: { include: { role: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: input.pageSize
    }),
    prisma.user.count({ where })
  ]);

  return {
    items: items.map(toUserResponse),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function createUser(input: CreateUserInput, actorId: string) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findFirst({ where: { email, isDeleted: false } });

  if (existing) {
    throw new AppError("Ya existe un usuario con ese correo.", 409, "USER_ALREADY_EXISTS");
  }

  const roles = await validateRoles(input.roleIds);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await argon2.hash(input.password),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: cleanOptional(input.phone),
      documentNumber: cleanOptional(input.documentNumber),
      position: cleanOptional(input.position),
      status: input.status,
      mustChangePassword: true,
      createdById: actorId,
      updatedById: actorId,
      userRoles: {
        create: roles.map((role) => ({ roleId: role.id }))
      }
    },
    include: { userRoles: { include: { role: true } } }
  });

  return toUserResponse(user);
}

export async function updateUser(userId: string, input: UpdateUserInput, actorId: string) {
  const existing = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    include: { userRoles: { include: { role: true } } }
  });
  if (!existing) {
    throw new AppError("El usuario no existe o fue eliminado.", 404, "USER_NOT_FOUND");
  }

  assertUserIsManageable(existing.userRoles.map(({ role }) => role.code));

  if (input.email) {
    const nextEmail = input.email.toLowerCase().trim();
    const duplicated = await prisma.user.findFirst({
      where: {
        email: nextEmail,
        isDeleted: false,
        id: { not: userId }
      }
    });

    if (duplicated) {
      throw new AppError("Ya existe otro usuario con ese correo.", 409, "USER_ALREADY_EXISTS");
    }
  }

  const roles = input.roleIds ? await validateRoles(input.roleIds) : null;
  const user = await prisma.$transaction(async (tx) => {
    if (roles) {
      await tx.userRole.deleteMany({ where: { userId } });
      await tx.userRole.createMany({ data: roles.map((role) => ({ userId, roleId: role.id })) });
    }

    return tx.user.update({
      where: { id: userId },
      data: {
        ...(input.email !== undefined ? { email: input.email.toLowerCase().trim() } : {}),
        ...(input.password ? { passwordHash: await argon2.hash(input.password), mustChangePassword: true } : {}),
        ...(input.firstName !== undefined ? { firstName: input.firstName.trim() } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName.trim() } : {}),
        ...(input.phone !== undefined ? { phone: cleanOptional(input.phone) } : {}),
        ...(input.documentNumber !== undefined ? { documentNumber: cleanOptional(input.documentNumber) } : {}),
        ...(input.position !== undefined ? { position: cleanOptional(input.position) } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        updatedById: actorId
      },
      include: { userRoles: { include: { role: true } } }
    });
  });

  return toUserResponse(user);
}

export async function deleteUser(userId: string, actorId: string) {
  if (userId === actorId) {
    throw new AppError("No puedes eliminar tu propio usuario.", 409, "CANNOT_DELETE_SELF");
  }

  const existing = await prisma.user.findFirst({
    where: { id: userId, isDeleted: false },
    include: { userRoles: { include: { role: true } } }
  });
  if (!existing) {
    throw new AppError("El usuario no existe o ya fue eliminado.", 404, "USER_NOT_FOUND");
  }

  assertUserIsManageable(existing.userRoles.map(({ role }) => role.code));

  await prisma.user.update({
    where: { id: userId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: userId };
}

async function validateRoles(roleIds: string[]) {
  const uniqueRoleIds = Array.from(new Set(roleIds));
  const roles = await prisma.role.findMany({ where: { id: { in: uniqueRoleIds }, isDeleted: false } });

  if (roles.length !== uniqueRoleIds.length) {
    throw new AppError("Uno o mas roles seleccionados no son validos.", 422, "INVALID_ROLES");
  }

  if (roles.some((role) => role.code === ROLE_CODES.SUPER_ADMIN)) {
    throw new AppError("El rol Super Admin es exclusivo del usuario principal.", 403, "SUPER_ADMIN_ROLE_PROTECTED");
  }

  return roles;
}

function assertUserIsManageable(roleCodes: string[]) {
  if (roleCodes.includes(ROLE_CODES.SUPER_ADMIN)) {
    throw new AppError("El usuario Super Admin esta protegido y no puede modificarse.", 403, "SUPER_ADMIN_PROTECTED");
  }
}
