import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "../api/create-client";
import { queryClient } from "@/lib/query-client";

export default function useCreateClient() {
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Клиент добавлен");
    },
    onError: () => {
      toast.error("Не удалось добавить клиента");
    },
  });
}
