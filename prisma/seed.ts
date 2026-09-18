import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { PERMISSIONS } from "../apps/api/src/common/constants/permissions";
import { ROLE_CODES } from "../apps/api/src/common/constants/roles";

const prisma = new PrismaClient();

const permissionDefinitions = Object.values(PERMISSIONS).map((code) => {
  const [module, action] = code.split(":");
  return {
    code,
    module,
    description: `${module}.${action}`
  };
});

async function main() {
  const permissions = await Promise.all(
    permissionDefinitions.map((permission) =>
      prisma.permission.upsert({
        where: { code: permission.code },
        update: permission,
        create: permission
      })
    )
  );

  const existingSuperAdminRole = await prisma.role.findFirst({ where: { code: ROLE_CODES.SUPER_ADMIN, isDeleted: false } });
  const superAdminRole = existingSuperAdminRole
    ? await prisma.role.update({
        where: { id: existingSuperAdminRole.id },
        data: {
          name: "Super Admin",
          description: "Acceso completo a la plataforma.",
          isSystem: true
        }
      })
    : await prisma.role.create({ data: {
      name: "Super Admin",
      code: ROLE_CODES.SUPER_ADMIN,
      description: "Acceso completo a la plataforma.",
      isSystem: true
    } });

  const existingAdminRole = await prisma.role.findFirst({ where: { code: ROLE_CODES.ADMIN, isDeleted: false } });
  if (existingAdminRole) {
    await prisma.role.update({ where: { id: existingAdminRole.id }, data: {
      name: "Admin",
      description: "Administracion operativa de la plataforma.",
      isSystem: true
    } });
  } else {
    await prisma.role.create({ data: {
      name: "Admin",
      code: ROLE_CODES.ADMIN,
      description: "Administracion operativa de la plataforma.",
      isSystem: true
    } });
  }

  const existingUserRole = await prisma.role.findFirst({ where: { code: ROLE_CODES.USER, isDeleted: false } });
  if (existingUserRole) {
    await prisma.role.update({ where: { id: existingUserRole.id }, data: {
      name: "Usuario",
      description: "Usuario operativo con permisos limitados.",
      isSystem: true
    } });
  } else {
    await prisma.role.create({ data: {
      name: "Usuario",
      code: ROLE_CODES.USER,
      description: "Usuario operativo con permisos limitados.",
      isSystem: true
    } });
  }

  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: superAdminRole.id,
          permissionId: permission.id
        }
      })
    )
  );

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "admin@dyxerplat.local";
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD ?? "Cambiar123!";

  const normalizedSuperAdminEmail = superAdminEmail.toLowerCase();
  const existingSuperAdmin = await prisma.user.findFirst({ where: { email: normalizedSuperAdminEmail, isDeleted: false } });
  const superAdmin = existingSuperAdmin
    ? await prisma.user.update({ where: { id: existingSuperAdmin.id }, data: {
      firstName: process.env.SUPER_ADMIN_FIRST_NAME ?? "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME ?? "Admin"
    } })
    : await prisma.user.create({ data: {
      email: normalizedSuperAdminEmail,
      passwordHash: await argon2.hash(superAdminPassword),
      firstName: process.env.SUPER_ADMIN_FIRST_NAME ?? "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME ?? "Admin",
      mustChangePassword: true
    } });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: superAdmin.id,
        roleId: superAdminRole.id
      }
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRole.id
    }
  });

  console.log(`Seed completado. Super admin: ${superAdmin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
