export type Permission = {
  id: string;
  code: string;
  module: string;
  description: string | null;
  createdAt: string;
};

export type Role = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isSystem: boolean;
  usersCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type RoleFormValues = {
  name: string;
  code: string;
  description: string;
  permissionCodes: string[];
};

export type RolesPage = {
  items: Role[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};
