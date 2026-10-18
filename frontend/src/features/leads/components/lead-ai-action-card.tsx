"use client";

import { useState } from "react";
import { Check, ClipboardList, Loader2, RefreshCw, StickyNote, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/query-client";
import { LEAD_STATUS_OPTIONS } from "@/lib/options";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { createTask } from "@/features/tasks/api/create-task";
import { createLeadNote } from "../api/lead-notes";
import { changeLeadStatus, type LeadStatus } from "../api/lead-change-status";
import type { LeadAiAction } from "../api/chat-lead-ai";
import { leadNotesKey } from "../hooks/use-lead-notes";

type CardState = "idle" | "saving" | "done" | "dismissed";

const TITLES: Record<LeadAiAction["type"], string> = {
  create_task: "Задача",
  add_note: "Заметка",
  change_status: "Статус лида",
};

const ICONS = {
  create_task: ClipboardList,
  add_note: StickyNote,
  change_status: RefreshCw,
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function LeadAiActionCard({
  leadId,
  action,
}: {
  leadId: string;
  action: LeadAiAction;
}) {
  const user = useAuthStore((s) => s.user);
  const [state, setState] = useState<CardState>("idle");
  const [title, setTitle] = useState(action.type === "create_task" ? action.title : "");
  const [deadline, setDeadline] = useState(
    action.type === "create_task" ? toLocalInput(action.deadline) : ""
  );
  const [text, setText] = useState(action.type === "add_note" ? action.text : "");
  const [status, setStatus] = useState<LeadStatus>(
    action.type === "change_status" ? action.status : "IN_PROGRESS"
  );

  const Icon = ICONS[action.type];

  const apply = async () => {
    setState("saving");
    try {
      if (action.type === "create_task") {
        await createTask({
          title: title.trim(),
          leadId,
          // OWNER can't be an assignee (backend rule), so leave such tasks unassigned
          assignedToId: user?.role === "OWNER" ? undefined : user?.id,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      } else if (action.type === "add_note") {
        await createLeadNote(leadId, text.trim());
        queryClient.invalidateQueries({ queryKey: leadNotesKey(leadId) });
      } else {
        await changeLeadStatus(leadId, { status });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
      }
      setState("done");
    } catch {
      toast.error("Не удалось выполнить действие");
      setState("idle");
    }
  };

  if (state === "done" || state === "dismissed") {
    let summary = text;
    if (action.type === "create_task") summary = title;
    if (action.type === "change_status") {
      summary = LEAD_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
    }

    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          {TITLES[action.type]}: {summary}
        </span>
        <span className="ml-auto shrink-0">{state === "done" ? "✓ создано" : "отклонено"}</span>
      </div>
    );
  }

  const canApply =
    state === "idle" &&
    (action.type === "create_task" ? title.trim() : action.type === "add_note" ? text.trim() : true);

  return (
    <div className="rounded-md border bg-background p-3 text-sm">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {TITLES[action.type]}
      </div>

      {action.type === "create_task" && (
        <div className="space-y-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Название задачи" />
          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            aria-label="Срок"
          />
        </div>
      )}

      {action.type === "add_note" && (
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="Текст заметки" />
      )}

      {action.type === "change_status" && (
        <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
          <SelectTrigger aria-label="Новый статус">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={() => setState("dismissed")} disabled={state === "saving"}>
          <X className="h-3.5 w-3.5" />
          Отклонить
        </Button>
        <Button type="button" size="sm" onClick={apply} disabled={!canApply}>
          {state === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {action.type === "change_status" ? "Применить" : "Создать"}
        </Button>
      </div>
    </div>
  );
}
