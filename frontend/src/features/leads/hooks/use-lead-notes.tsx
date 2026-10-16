import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "@/lib/query-client";
import {
  createLeadNote,
  deleteLeadNote,
  getLeadNotes,
} from "../api/lead-notes";

export const leadNotesKey = (leadId: string) => ["lead-notes", leadId];

export function useLeadNotes(leadId: string | null) {
  return useQuery({
    queryKey: leadNotesKey(leadId ?? ""),
    queryFn: () => getLeadNotes(leadId!),
    enabled: !!leadId,
  });
}

export function useCreateLeadNote(leadId: string) {
  return useMutation({
    mutationFn: (text: string) => createLeadNote(leadId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadNotesKey(leadId) });
    },
    onError: () => {
      toast.error("Не удалось добавить заметку");
    },
  });
}

export function useDeleteLeadNote(leadId: string) {
  return useMutation({
    mutationFn: (noteId: string) => deleteLeadNote(leadId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadNotesKey(leadId) });
      toast.success("Заметка удалена");
    },
    onError: () => {
      toast.error("Не удалось удалить заметку");
    },
  });
}
