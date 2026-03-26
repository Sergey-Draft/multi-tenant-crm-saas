import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/get-user";

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => getUser(userId!),
    enabled: Boolean(userId),
  });
}
