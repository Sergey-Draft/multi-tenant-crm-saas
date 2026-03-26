import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateUser,
  type UpdateUserDto,
} from "@/features/users/api/update-user";

export default function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", id] });
    },
  });
}
