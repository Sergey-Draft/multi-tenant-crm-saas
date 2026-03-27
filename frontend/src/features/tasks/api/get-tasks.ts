import { api } from "@/lib/api-client";
import type { Task } from "@/types/task";

export const getTasks = async (): Promise<Task[]> => {
  const { data } = await api.get<Task[]>("/tasks");
  return data;
};
