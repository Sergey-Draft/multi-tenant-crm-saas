import { api } from "@/lib/api-client"
import { Company } from "./get-companies"

export const getCompany = async (id: string): Promise<Company> => {
  const { data } = await api.get(`/companies/${id}`)
  return data
}
