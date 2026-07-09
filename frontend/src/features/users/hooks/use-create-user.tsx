import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "../api/create-user";
import { queryClient } from "@/lib/query-client";

export default function useCreateUser() {


  return useMutation({
    mutationFn: createUser,

    onSuccess() {
      return queryClient.invalidateQueries({
       queryKey: ["users"]
      })
    },
  })

}
