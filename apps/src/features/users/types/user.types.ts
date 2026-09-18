export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export type UserRole = {
  id: string;
  name: string;
  code: string;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  documentNumber: string | null;
  position: string | null;
  status: UserStatus;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
};

export type UserFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  documentNumber: string;
  position: string;
  status: UserStatus;
  roleIds: string[];
};

export type PaginatedUsers = {
  items: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
