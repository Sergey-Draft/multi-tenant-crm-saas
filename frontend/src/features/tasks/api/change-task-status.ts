import { api } from "@/lib/api-client";
import type { Task, TaskStatus } from "@/types/task";

export const changeTaskStatus = async (id: string, status: TaskStatus): Promise<Task> => {
  const { data } = await api.patch<Task>(`/tasks/status/${id}`, { status });
  return data;
};
