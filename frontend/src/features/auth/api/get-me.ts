import { api } from "@/lib/api-client"

export const getMe = async () => {
  const { data } = await api.get("/auth/me")
  return data
}