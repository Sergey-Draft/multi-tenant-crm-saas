"use client";

import { useState } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useCreateLeadNote,
  useDeleteLeadNote,
  useLeadNotes,
} from "../hooks/use-lead-notes";

const MAX_LENGTH = 5000;
// Совпадает с NOTE_MODERATOR_ROLES на бэкенде
const MODERATOR_ROLES = ["SUPER_ADMIN", "OWNER", "ADMIN"];

function formatNoteDate(dateStr: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function LeadNotes({ leadId }: { leadId: string }) {
  const [text, setText] = useState("");
  const user = useAuthStore((s) => s.user);
  const { data: notes, isLoading } = useLeadNotes(leadId);
  const createNote = useCreateLeadNote(leadId);
  const deleteNote = useDeleteLeadNote(leadId);

  const canSubmit = text.trim().length > 0 && !createNote.isPending;
  const isModerator = MODERATOR_ROLES.includes(user?.role);

  const submit = () => {
    if (!canSubmit) return;
    createNote.mutate(text.trim(), { onSuccess: () => setText("") });
  };

  return (
    <div>
      <Label className="text-xs font-medium text-muted-foreground mb-3 block">
        Заметки ({notes?.length ?? 0})
      </Label>

      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              submit();
            }
          }}
          maxLength={MAX_LENGTH}
          rows={2}
          placeholder="Итоги звонка, договорённости…"
          aria-label="Новая заметка"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Ctrl+Enter — отправить</span>
          <Button type="button" size="sm" onClick={submit} disabled={!canSubmit}>
            {createNote.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Добавить
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground mt-3">Загрузка…</p>
      ) : !notes?.length ? (
        <p className="text-sm text-muted-foreground mt-3">Заметок пока нет</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {notes.map((note) => {
            const canDelete = isModerator || note.author?.id === user?.id;
            return (
              <li key={note.id} className="group rounded-md border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    {note.author?.name || note.author?.email || "Удалённый пользователь"}
                    {" · "}
                    {formatNoteDate(note.createdAt)}
                  </span>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => deleteNote.mutate(note.id)}
                      disabled={deleteNote.isPending}
                      className="sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:text-destructive"
                      aria-label="Удалить заметку"
                      title="Удалить"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap wrap-break-word leading-relaxed">
                  {note.text}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
