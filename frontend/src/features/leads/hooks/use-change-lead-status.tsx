import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import { changeLeadStatus, changeLeadStatusData } from "../api/lead-change-status";

export default function useChangeLeadSytatus() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: changeLeadStatusData }) =>
      changeLeadStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Статус лида обновлён");
    },
    onError: () => {
      toast.error("Не удалось обновить статус");
    },
  });
}
