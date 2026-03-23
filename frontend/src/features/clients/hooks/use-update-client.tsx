import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateClient, UpdateClientData } from "../api/update-client";
import { queryClient } from "@/lib/query-client";

export default function useUpdateClient() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Клиент обновлён");
    },
    onError: () => {
      toast.error("Не удалось обновить клиента");
    },
  });
}
