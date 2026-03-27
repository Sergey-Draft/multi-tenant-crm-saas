import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { changeTaskStatus } from "../api/change-task-status";
import type { TaskStatus } from "@/types/task";

export function useChangeTaskStatus() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      changeTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: () => {
      toast.error("Не удалось изменить статус задачи");
    },
  });
}
