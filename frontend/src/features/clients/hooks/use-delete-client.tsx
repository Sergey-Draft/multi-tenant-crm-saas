import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteClient } from "../api/delete-client";
import { queryClient } from './../../../lib/query-client';

export default function useDeleteClient() {
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Клиент удалён");
    },
    onError: () => {
      toast.error("Не удалось удалить клиента");
    },
  });
}
