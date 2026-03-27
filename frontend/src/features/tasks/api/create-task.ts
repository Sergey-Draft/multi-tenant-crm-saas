import { api } from "@/lib/api-client";
import type { CreateTaskDto, Task } from "@/types/task";

export const createTask = async (dto: CreateTaskDto): Promise<Task> => {
  const { data } = await api.post<Task>("/tasks", dto);
  return data;
};
