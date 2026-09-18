import { prisma } from "../../database/prisma";
import { AppError } from "../../common/errors/AppError";
import { ROLE_CODES } from "../../common/constants/roles";
import type { CreateRoleInput, ListRolesInput, UpdateRoleInput } from "./roles.schemas";

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, "_");
}

function toRoleResponse(role: {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  usersCount?: number;
  _count?: { users: number };
  permissions: Array<{ permission: { code: string } }>;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    isSystem: role.isSystem,
    usersCount: role.usersCount ?? role._count?.users ?? 0,
    permissions: role.permissions.map((item) => item.permission.code),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt
  };
}

export async function listRoles(input: ListRolesInput) {
  const where = {
    isDeleted: false,
    code: { not: ROLE_CODES.SUPER_ADMIN },
    ...(input.type ? { isSystem: input.type === "SYSTEM" } : {}),
    ...(input.q ? {
      OR: [
        { name: { contains: input.q, mode: "insensitive" as const } },
        { code: { contains: input.q, mode: "insensitive" as const } },
        { description: { contains: input.q, mode: "insensitive" as const } }
      ]
    } : {})
  };
  const skip = (input.page - 1) * input.pageSize;
  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } }
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
      skip,
      take: input.pageSize
    }),
    prisma.role.count({ where })
  ]);

  return {
    items: roles.map(toRoleResponse),
    pagination: {
      page: input.page,
      pageSize: input.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.pageSize))
    }
  };
}

export async function listPermissions() {
  return prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { code: "asc" }]
  });
}

export async function createRole(input: CreateRoleInput, actorId: string) {
  const code = normalizeCode(input.code);
  const existing = await prisma.role.findFirst({ where: { code, isDeleted: false } });

  if (existing) {
    throw new AppError(`Ya existe un rol activo con el código «${code}». Usa otro código o edita el rol existente.`, 409, "ROLE_ALREADY_EXISTS");
  }

  const permissions = await validatePermissions(input.permissionCodes);

  const role = await prisma.role.create({
    data: {
      name: input.name.trim(),
      code,
      description: input.description?.trim() || null,
      createdById: actorId,
      updatedById: actorId,
      permissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id
        }))
      }
    },
    include: {
      permissions: {
        include: { permission: true }
      },
      _count: {
        select: { users: true }
      }
    }
  });

  return toRoleResponse(role);
}

export async function updateRole(roleId: string, input: UpdateRoleInput, actorId: string) {
  const existing = await prisma.role.findFirst({
    where: { id: roleId, isDeleted: false }
  });

  if (!existing) {
    throw new AppError("El rol no existe o fue eliminado.", 404, "ROLE_NOT_FOUND");
  }

  if (existing.code === ROLE_CODES.SUPER_ADMIN) {
    throw new AppError("El rol Super Admin esta protegido y no puede modificarse.", 403, "SUPER_ADMIN_ROLE_PROTECTED");
  }

  if (existing.isSystem && input.code && normalizeCode(input.code) !== existing.code) {
    throw new AppError("No se puede cambiar el codigo de un rol del sistema.", 409, "SYSTEM_ROLE_CODE_LOCKED");
  }

  const nextCode = input.code ? normalizeCode(input.code) : existing.code;
  if (nextCode !== existing.code) {
    const duplicated = await prisma.role.findFirst({
      where: { code: nextCode, isDeleted: false, id: { not: roleId } }
    });

    if (duplicated) {
      throw new AppError(`El código «${nextCode}» ya pertenece a un rol activo. Usa otro código.`, 409, "ROLE_ALREADY_EXISTS");
    }
  }

  const permissions = input.permissionCodes ? await validatePermissions(input.permissionCodes) : null;

  const role = await prisma.$transaction(async (tx) => {
    if (permissions) {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      await tx.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId,
          permissionId: permission.id
        }))
      });
    }

    return tx.role.update({
      where: { id: roleId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.code !== undefined ? { code: nextCode } : {}),
        ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
        updatedById: actorId
      },
      include: {
        permissions: {
          include: { permission: true }
        },
        _count: {
          select: { users: true }
        }
      }
    });
  });

  return toRoleResponse(role);
}

export async function deleteRole(roleId: string, actorId: string) {
  const existing = await prisma.role.findFirst({
    where: { id: roleId, isDeleted: false },
    include: { _count: { select: { users: true } } }
  });

  if (!existing) {
    throw new AppError("El rol no existe o ya fue eliminado.", 404, "ROLE_NOT_FOUND");
  }

  if (existing.isSystem) {
    throw new AppError("No se puede eliminar un rol del sistema.", 409, "SYSTEM_ROLE_LOCKED");
  }

  if (existing._count.users > 0) {
    const total = existing._count.users;
    throw new AppError(
      `No se puede eliminar este rol porque está asignado a ${total} ${total === 1 ? "usuario" : "usuarios"}. Reasigna ${total === 1 ? "ese usuario" : "esos usuarios"} a otro rol e inténtalo nuevamente.`,
      409,
      "ROLE_HAS_USERS",
      { assignedUsers: total }
    );
  }

  await prisma.role.update({
    where: { id: roleId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: actorId,
      updatedById: actorId
    }
  });

  return { id: roleId };
}

async function validatePermissions(permissionCodes: string[]) {
  const uniquePermissionCodes = Array.from(new Set(permissionCodes));
  const permissions = await prisma.permission.findMany({
    where: { code: { in: uniquePermissionCodes } }
  });

  if (permissions.length !== uniquePermissionCodes.length) {
    throw new AppError("Uno o mas permisos seleccionados no son validos.", 422, "INVALID_PERMISSIONS");
  }

  return permissions;
}
