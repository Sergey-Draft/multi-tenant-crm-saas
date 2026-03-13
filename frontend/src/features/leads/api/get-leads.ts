import { api } from "@/lib/api-client"

export const getLeads = async () => {
  const response = await api.get("/leads")
  return response.data;
}