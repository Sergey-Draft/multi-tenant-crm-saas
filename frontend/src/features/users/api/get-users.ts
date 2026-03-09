import { api } from "@/lib/api-client"

export const getUsers = async () => {
  const response = await api.get("/users")
  return response.data;
}