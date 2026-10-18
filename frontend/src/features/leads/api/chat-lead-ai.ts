import { api } from "@/lib/api-client";
import type { LeadStatus } from "./lead-change-status";

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

export type LeadAiAction =
  | { type: "create_task"; title: string; deadline: string | null }
  | { type: "add_note"; text: string }
  | { type: "change_status"; status: LeadStatus };

export type LeadAiChatResponse = {
  reply: string;
  actions: LeadAiAction[];
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
