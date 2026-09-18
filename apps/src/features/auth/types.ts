export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  roles: string[];
  permissions: string[];
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};
