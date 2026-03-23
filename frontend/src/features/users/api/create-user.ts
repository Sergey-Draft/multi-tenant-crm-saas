import { api } from "@/lib/api-client"
import { CreateUserDto } from "@/types/user";


export const createUser = async (data: CreateUserDto) => {
  const response = await api.post("/users", data)
  return response.data;
}