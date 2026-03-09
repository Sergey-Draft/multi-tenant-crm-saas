export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

export interface CreateUserDto {
  email: string
  password: string
  role: UserRole
}