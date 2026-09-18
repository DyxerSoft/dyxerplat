export const ROLE_CODES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER"
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

/** Roles que no se listan ni se gestionan desde el CRM. */
export const PROTECTED_ROLE_CODES = [ROLE_CODES.SUPER_ADMIN] as const;

export type ProtectedRoleCode = (typeof PROTECTED_ROLE_CODES)[number];

export function isProtectedRoleCode(code: string) {
  return (PROTECTED_ROLE_CODES as readonly string[]).includes(code);
}
