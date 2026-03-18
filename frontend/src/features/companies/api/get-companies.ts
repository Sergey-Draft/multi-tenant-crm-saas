import { api } from "@/lib/api-client"

export interface Company {
  id: string
  name: string
  createdAt?: string
}

export const getCompanies = async (): Promise<Company[]> => {
  const { data } = await api.get("/companies")
  return data
}
