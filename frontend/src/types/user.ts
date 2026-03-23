export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
