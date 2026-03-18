import { api } from "@/lib/api-client";

export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED" | null;

export interface UpdateLeadData {
  title?: string;
  description?: string;
  clientId?: string;
  assignedToId?: string;
  status?: LeadStatus;
  dateDue?: string;
}

export async function updateLead(id: string, data: UpdateLeadData) {
  const res = await api.patch(`/leads/${id}`, data);
  return res.data;
}
