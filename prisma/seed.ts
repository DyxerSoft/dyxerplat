import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { PERMISSIONS, ROLE_CODES } from "@dyxerplat/shared";

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

  const superAdminRole = await prisma.role.upsert({
    where: { code: ROLE_CODES.SUPER_ADMIN },
    update: {
      name: "Super Admin",
      description: "Acceso completo a la plataforma.",
      isSystem: true
    },
    create: {
      name: "Super Admin",
      code: ROLE_CODES.SUPER_ADMIN,
      description: "Acceso completo a la plataforma.",
      isSystem: true
    }
  });

  await prisma.role.upsert({
    where: { code: ROLE_CODES.ADMIN },
    update: {
      name: "Admin",
      description: "Administracion operativa de la plataforma.",
      isSystem: true
    },
    create: {
      name: "Admin",
      code: ROLE_CODES.ADMIN,
      description: "Administracion operativa de la plataforma.",
      isSystem: true
    }
  });

  await prisma.role.upsert({
    where: { code: ROLE_CODES.USER },
    update: {
      name: "Usuario",
      description: "Usuario operativo con permisos limitados.",
      isSystem: true
    },
    create: {
      name: "Usuario",
      code: ROLE_CODES.USER,
      description: "Usuario operativo con permisos limitados.",
      isSystem: true
    }
  });

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

  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail.toLowerCase() },
    update: {
      firstName: process.env.SUPER_ADMIN_FIRST_NAME ?? "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME ?? "Admin"
    },
    create: {
      email: superAdminEmail.toLowerCase(),
      passwordHash: await argon2.hash(superAdminPassword),
      firstName: process.env.SUPER_ADMIN_FIRST_NAME ?? "Super",
      lastName: process.env.SUPER_ADMIN_LAST_NAME ?? "Admin",
      mustChangePassword: true
    }
  });

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
