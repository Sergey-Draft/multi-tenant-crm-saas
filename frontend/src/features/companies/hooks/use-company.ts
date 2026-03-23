import { useQuery } from "@tanstack/react-query"
import { getCompany } from "../api/get-company"

export const useCompany = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: () => getCompany(companyId!),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}
