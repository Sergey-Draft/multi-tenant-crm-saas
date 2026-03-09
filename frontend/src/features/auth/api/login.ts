import { api } from "@/lib/api-client"

interface LoginDto {
  email: string
  password: string
}

export const login = async (data: LoginDto) => {
  const response = await api.post("/auth/login", data)
  return response.data
}