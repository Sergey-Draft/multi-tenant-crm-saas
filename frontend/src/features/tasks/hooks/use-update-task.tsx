import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { updateTask } from "../api/update-task";

export function useUpdateTask() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateTask>[1] }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача обновлена");
    },
    onError: () => {
      toast.error("Не удалось обновить задачу");
    },
  });
}
