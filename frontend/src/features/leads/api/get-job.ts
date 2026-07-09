import { api } from "@/lib/api-client"

export const getJob = async (id: string) => {
  const response = await api.get(`/imports/jobs/${id}`);
  return response.data.job;
}