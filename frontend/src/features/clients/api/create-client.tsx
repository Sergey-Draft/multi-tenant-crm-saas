import { api } from "@/lib/api-client";

interface createClient {
  name:string
  email:string
  phone: string
}


export async function createClient(data:createClient) {
  const res = await api.post("/clients", data);
  return res.data;
}