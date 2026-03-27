import { api } from "@/lib/api-client";
import type { Task, UpdateTaskDto } from "@/types/task";

export const updateTask = async (id: string, dto: UpdateTaskDto): Promise<Task> => {
  const { data } = await api.patch<Task>(`/tasks/${id}`, dto);
  return data;
};
