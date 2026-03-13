import { api } from "@/lib/api-client";

export async function getClient(id: string) {
  const res = await api.get(`/clients/${id}`);
  return res.data;
}
