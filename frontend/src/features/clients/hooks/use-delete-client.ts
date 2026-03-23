import { useMutation } from "@tanstack/react-query";
import { deleteClient } from "../api/delete-client";
import { queryClient } from "@/lib/query-client";

export default function useDeleteClient() {
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
     return queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
