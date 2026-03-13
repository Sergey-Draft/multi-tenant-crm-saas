import { api } from "@/lib/api-client";

export type UpdateClientData = Partial<{
  name: string;
  email: string;
  phone: string;
}>;

export async function updateClient(id: string, data: UpdateClientData) {
  const res = await api.patch(`/clients/${id}`, data);
  return res.data;
}
