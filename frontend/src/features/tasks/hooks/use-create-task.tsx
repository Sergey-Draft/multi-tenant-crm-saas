import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { createTask } from "../api/create-task";

export function useCreateTask() {
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача создана");
    },
    onError: () => {
      toast.error("Не удалось создать задачу");
    },
  });
}
