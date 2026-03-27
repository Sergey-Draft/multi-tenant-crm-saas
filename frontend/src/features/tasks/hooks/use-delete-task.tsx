import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { deleteTask } from "../api/delete-task";

export function useDeleteTask() {
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача удалена");
    },
    onError: () => {
      toast.error("Не удалось удалить задачу");
    },
  });
}
