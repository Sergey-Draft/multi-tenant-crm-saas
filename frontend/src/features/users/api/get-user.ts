import { api } from "@/lib/api-client";
import type { User } from "@/types/user";

export const getUser = async (id: string) => {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
};
