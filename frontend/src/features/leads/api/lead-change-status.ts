import { api } from "@/lib/api-client";

export type LeadStatus = "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED";

export interface changeLeadStatusData {
  status: LeadStatus;
}

export const changeLeadStatus = async (
  id: string,
  data: changeLeadStatusData
) => {
  const response = await api.patch(`/leads/status/${id}`, data);
  return response.data;
};
