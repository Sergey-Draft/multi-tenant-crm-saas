"use client";

import { useEffect } from "react";
import { useMe } from "@/features/auth/hooks/use-me";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { queryClient } from "@/lib/query-client";
import { getUsers } from "@/features/users/api/get-users";
import { getClients } from "@/features/clients/api/get-clients";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const { data } = useMe();

  useEffect(() => {
    if (data) {
      setUser(data);

      queryClient.prefetchQuery({
        queryKey: ["users"],
        queryFn: getUsers,
        staleTime: Infinity,
      });

      queryClient.prefetchQuery({
        queryKey: ["clients"],
        queryFn: getClients,
        staleTime: Infinity,
      });
    }
  }, [data]);

  return children;
}
