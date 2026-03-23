import { api } from "@/lib/api-client";

export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'REJECTED' | null

interface CreateLead {
  title:string
  description:string
  assignedToId: string
  clientId: string
  status: LeadStatus
  dateDue: string
}


export async function createLead(data: CreateLead) {
  const res = await api.post("/leads", data);
  return res.data;
}