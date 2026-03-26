import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/get-users";

export default function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 2,
  });
}
