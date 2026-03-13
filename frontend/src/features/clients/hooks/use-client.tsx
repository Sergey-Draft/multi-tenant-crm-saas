import { useQuery } from "@tanstack/react-query";
import { getClient } from "../api/get-client";

export function useClient(id: string | null) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => getClient(id!),
    enabled: !!id,
  });
}
