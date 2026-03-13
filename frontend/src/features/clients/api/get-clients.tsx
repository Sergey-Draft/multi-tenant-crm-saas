import { api } from "@/lib/api-client";

export async function getClients() {
  const res = await api.get("/clients");
  return res.data;
}