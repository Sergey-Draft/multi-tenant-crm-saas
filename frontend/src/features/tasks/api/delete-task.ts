import { api } from "@/lib/api-client";

export const deleteTask = async (id: string) => {
  const { data } = await api.delete(`/tasks/${id}`);
  return data;
};
