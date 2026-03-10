import { useQuery } from "@tanstack/react-query"
import { getMe } from "../api/get-me"

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe, 
    staleTime: 1000 * 60 * 10,
    retry: false,
    refetchOnWindowFocus: false,
  })
}