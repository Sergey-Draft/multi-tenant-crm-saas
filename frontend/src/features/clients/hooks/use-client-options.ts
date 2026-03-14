import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getClients } from "../api/get-clients";
import { Option } from "@/types/option";

export function useClientOptions(): { options: Option[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    staleTime: Infinity,
  });

  const options: Option[] = useMemo(
    () =>
      (data ?? []).map((client: { id: string; name: string }) => ({
        value: client.id,
        label: client.name,
      })),
    [data]
  );

  return { options, isLoading };
}
