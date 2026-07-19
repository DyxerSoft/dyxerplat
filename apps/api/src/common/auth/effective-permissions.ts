import { prisma } from "../../database/prisma";
import { ROLE_CODES } from "../constants/roles";

type RoleWithPermissions = {
  role: {
    code: string;
    isDeleted: boolean;
    permissions: Array<{ permission: { code: string } }>;
  };
};

export async function getEffectivePermissions(userRoles: RoleWithPermissions[]) {
  const activeRoles = userRoles.filter(({ role }) => !role.isDeleted);

  if (activeRoles.some(({ role }) => role.code === ROLE_CODES.SUPER_ADMIN)) {
    const permissions = await prisma.permission.findMany({ select: { code: true } });
    return permissions.map(({ code }) => code);
  }

  return Array.from(
    new Set(
      activeRoles.flatMap(({ role }) =>
        role.permissions.map(({ permission }) => permission.code)
      )
    )
  );
}
