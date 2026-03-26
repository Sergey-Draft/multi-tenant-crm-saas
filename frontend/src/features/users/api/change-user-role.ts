import { api } from "@/lib/api-client";
import type { User, UserRole } from "@/types/user";

export const changeUserRole = async (
  id: string,
  dto: { role: UserRole }
): Promise<User> => {
  const { data } = await api.patch<User>(`/users/${id}/role`, dto);
  return data;
};
