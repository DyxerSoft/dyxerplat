export const PERMISSIONS = {
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  ROLES_MANAGE: "roles:manage",
  COMPANIES_CREATE: "companies:create",
  COMPANIES_READ: "companies:read",
  COMPANIES_UPDATE: "companies:update",
  COMPANIES_DELETE: "companies:delete",
  CONTACTS_CREATE: "contacts:create",
  CONTACTS_READ: "contacts:read",
  CONTACTS_UPDATE: "contacts:update",
  CONTACTS_DELETE: "contacts:delete",
  POSTS_CREATE: "posts:create",
  POSTS_READ: "posts:read",
  POSTS_UPDATE: "posts:update",
  POSTS_DELETE: "posts:delete",
  POSTS_PUBLISH: "posts:publish"
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
