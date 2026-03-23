import { api } from "@/lib/api-client";

export async function deleteClient(id: string) {
  const res = await api.delete(`/clients/${id}`);
  return res.data;
}
