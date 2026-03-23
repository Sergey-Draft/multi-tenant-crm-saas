import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getUsers } from "../api/get-users";
import { Option } from '@/types/option';

export function useUserOptions(): { options: Option[]; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: Infinity,
  });

  const options: Option[] = useMemo(
    () =>
      (data ?? []).map((user: { id: string; name: string; email: string }) => ({
        value: user.id,
        label: user.name || user.email,
      })),
    [data]
  );

  return { options, isLoading };
}
