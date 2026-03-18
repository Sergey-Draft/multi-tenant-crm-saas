import { api } from "@/lib/api-client"

export interface UpdateUserDto {
  name?: string
  email?: string
  isActive?: boolean
}

export const updateUser = async (id: string, dto: UpdateUserDto) => {
  const { data } = await api.patch(`/users/${id}`, dto)
  return data
}
