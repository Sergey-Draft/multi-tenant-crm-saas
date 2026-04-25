import { api } from "@/lib/api-client";

export type LeadAiInsight = {
  summary: string;
  nextAction: string;
  email: string;
};

export async function analyzeLeadAi(leadId: string): Promise<LeadAiInsight> {
  const res = await api.post<LeadAiInsight>(`/leads/${leadId}/ai-analyze`);
  return res.data;
}
