import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { changeUserRole } from "../api/change-user-role";
import type { UserRole } from "@/types/user";

export function useChangeUserRole() {
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      changeUserRole(id, { role }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
}
