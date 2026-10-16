import { api } from "@/lib/api-client";

export type LeadNote = {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string; email: string } | null;
};

export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const res = await api.get<LeadNote[]>(`/leads/${leadId}/notes`);
  return res.data;
}

export async function createLeadNote(
  leadId: string,
  text: string
): Promise<LeadNote> {
  const res = await api.post<LeadNote>(`/leads/${leadId}/notes`, { text });
  return res.data;
}

export async function deleteLeadNote(
  leadId: string,
  noteId: string
): Promise<void> {
  await api.delete(`/leads/${leadId}/notes/${noteId}`);
}
