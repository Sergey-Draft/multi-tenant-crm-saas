import { api } from "@/lib/api-client";

export type LeadAiChatMode =
  | "CHAT"
  | "SUMMARY"
  | "NEXT_ACTION"
  | "DRAFT_EMAIL";

export type LeadAiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type LeadAiChatRequest = {
  mode: LeadAiChatMode;
  messages: LeadAiChatMessage[];
};

export type LeadAiChatResponse = {
  reply: string;
};

export async function chatLeadAi(
  leadId: string,
  body: LeadAiChatRequest
): Promise<LeadAiChatResponse> {
  const res = await api.post<LeadAiChatResponse>(
    `/leads/${leadId}/ai-chat`,
    body
  );
  return res.data;
}
