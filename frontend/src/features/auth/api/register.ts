import { api } from "@/lib/api-client";

export interface registerDto {
  companyName: string;
  name: string;
  email: string;
  password: string;
}

export default async function register(data: registerDto) {
  const response = await api.post("auth/register", data);
  return response.data;
}
