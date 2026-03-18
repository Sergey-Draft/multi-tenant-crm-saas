import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateLead, UpdateLeadData } from "../api/update-lead";
import { queryClient } from "@/lib/query-client";

export default function useUpdateLead() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadData }) =>
      updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Лид обновлён");
    },
    onError: () => {
      toast.error("Не удалось обновить лид");
    },
  });
}
