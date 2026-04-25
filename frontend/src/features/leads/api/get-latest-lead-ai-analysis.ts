import { api } from "@/lib/api-client";

export type LeadAiAnalysisSnapshot = {
  summary: string;
  nextAction: string;
  email: string;
  createdAt: string;
  usedFallback: boolean;
};

export type LeadAiAnalysisLatestResponse = {
  analysis: LeadAiAnalysisSnapshot | null;
};

export async function getLatestLeadAiAnalysis(
  leadId: string
): Promise<LeadAiAnalysisLatestResponse> {
  const res = await api.get<LeadAiAnalysisLatestResponse>(
    `/leads/${leadId}/ai-analysis/latest`
  );
  return res.data;
}
