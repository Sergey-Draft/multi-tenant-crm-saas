import { useQuery } from "@tanstack/react-query"
import { getCompanies } from "../api/get-companies"

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
    staleTime: 5 * 60 * 1000,
  })
}
