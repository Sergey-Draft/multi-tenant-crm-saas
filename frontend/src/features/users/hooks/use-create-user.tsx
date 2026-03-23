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


// export function useCreateUser() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: createUser,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["users"],
//       })
//     },
//   })
// }