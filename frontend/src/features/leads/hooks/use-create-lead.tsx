import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { createLead } from "../api/create-lead";

export default function useCreateLead() {


  return useMutation({
    mutationFn: createLead,

    onSuccess() {
      return queryClient.invalidateQueries({
       queryKey: ["leads"]
      })
    },
  })

}