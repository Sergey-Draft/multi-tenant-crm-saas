"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  chatLeadAi,
  type LeadAiChatMode,
  type LeadAiChatMessage,
} from "../api/chat-lead-ai";
import { analyzeLeadAi } from "../api/analyze-lead-ai";
import {
  getLatestLeadAiAnalysis,
  type LeadAiAnalysisSnapshot,
} from "../api/get-latest-lead-ai-analysis";
import { toast } from "sonner";
import { Database, Loader2, SendHorizontal } from "lucide-react";

const MODE_OPTIONS: { value: LeadAiChatMode; label: string }[] = [
  { value: "CHAT", label: "Диалог" },
  { value: "SUMMARY", label: "Резюме" },
  { value: "NEXT_ACTION", label: "Шаг" },
  { value: "DRAFT_EMAIL", label: "Письмо" },
];

type Row = LeadAiChatMessage & { id: string };

function formatAnalysisDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export type LeadAiAssistantSheetProps = {
  leadId: string | null;
  leadTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LeadAiAssistantSheet({
  leadId,
  leadTitle,
  open,
  onOpenChange,
}: LeadAiAssistantSheetProps) {
  const [mode, setMode] = useState<LeadAiChatMode>("CHAT");
  const [rows, setRows] = useState<Row[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<LeadAiAnalysisSnapshot | null>(
    null
  );
  const [latestLoading, setLatestLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshLatestAnalysis = useCallback(async () => {
    if (!leadId) return;
    setLatestLoading(true);
    try {
      const { analysis } = await getLatestLeadAiAnalysis(leadId);
      setLatestAnalysis(analysis);
    } catch {
      setLatestAnalysis(null);
    } finally {
      setLatestLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (open && leadId) {
      setRows([]);
      setInput("");
      setMode("CHAT");
      setLatestAnalysis(null);
      void refreshLatestAnalysis();
    }
  }, [open, leadId, refreshLatestAnalysis]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows, loading]);

  const sendWithMessages = useCallback(
    async (history: LeadAiChatMessage[]) => {
      if (!leadId) return;
      setLoading(true);
      try {
        const { reply } = await chatLeadAi(leadId, { mode, messages: history });
        setRows((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: string }).message)
            : "Ошибка сети";
        toast.error("Не удалось получить ответ", { description: msg });
        setRows((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Не удалось выполнить запрос. Попробуйте ещё раз.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [leadId, mode]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !leadId || loading) return;

    const userRow: Row = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setInput("");
    const nextRows = [...rows, userRow];
    setRows(nextRows);

    const payload: LeadAiChatMessage[] = nextRows.map(({ role, content }) => ({
      role,
      content,
    }));
    await sendWithMessages(payload);
  };

  const handlePersistAnalyze = async () => {
    if (!leadId || analyzeLoading) return;
    setAnalyzeLoading(true);
    try {
      await analyzeLeadAi(leadId);
      toast.success("Полный анализ сохранён в историю лида");
      await refreshLatestAnalysis();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Ошибка";
      toast.error("Не удалось сохранить анализ", { description: msg });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-[100dvh] max-h-[100dvh] w-full flex-col gap-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <SheetHeader className="border-b px-4 py-3 text-left">
          <SheetTitle className="text-lg">ИИ‑ассистент</SheetTitle>
          <SheetDescription className="line-clamp-2 text-sm">
            {leadTitle ? `Лид: ${leadTitle}` : "Задайте вопрос по текущему лиду."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-1.5 border-b px-4 py-2">
          {MODE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={mode === opt.value ? "default" : "outline"}
              className="h-9 rounded-md px-3 text-sm"
              onClick={() => setMode(opt.value)}
              disabled={loading}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <div className="border-b px-4 py-2">
          {latestLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Загрузка последнего разбора…
            </div>
          ) : latestAnalysis ? (
            <details className="group rounded-lg border bg-muted/30 text-sm">
              <summary className="cursor-pointer list-none px-3 py-2 font-medium [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-2">
                  <span>Последний сохранённый разбор</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatAnalysisDate(latestAnalysis.createdAt)}
                  </span>
                </span>
              </summary>
              <div className="max-h-72 overflow-y-auto space-y-3 border-t px-3 py-3 text-sm leading-relaxed">
                {latestAnalysis.usedFallback && (
                  <p className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-950 dark:text-amber-100">
                    Ответ без ИИ или упрощённый (fallback).
                  </p>
                )}
                <div>
                  <p className="font-semibold text-muted-foreground">Резюме</p>
                  <p className="mt-1 whitespace-pre-wrap">{latestAnalysis.summary}</p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Следующий шаг</p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {latestAnalysis.nextAction}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Черновик письма</p>
                  <p className="mt-1 whitespace-pre-wrap">{latestAnalysis.email}</p>
                </div>
              </div>
            </details>
          ) : (
            <p className="text-sm text-muted-foreground">
              Сохранённого полного разбора ещё нет. Нажмите «Сохранить полный анализ в
              CRM» внизу — здесь появится последний снимок.
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-3 py-3">
            {rows.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground">
                Выберите режим кнопками выше и напишите сообщение. Один запрос к
                модели на каждое ваше сообщение; полный JSON‑анализ (резюме, шаг,
                письмо) можно сохранить в CRM кнопкой внизу.
              </p>
            )}
            {rows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm",
                  row.role === "user"
                    ? "ml-4 border-primary/25 bg-primary/5"
                    : "mr-4 border-muted bg-muted/40"
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {row.role === "user" ? "Вы" : "Ассистент"}
                </p>
                <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                  {row.content}
                </p>
              </div>
            ))}
            {loading && (
              <div className="mr-4 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Ассистент пишет…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t px-4 py-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Сообщение… Enter — отправить, Shift+Enter — новая строка"
            rows={3}
            disabled={loading || !leadId}
            className="min-h-[84px] resize-none text-base"
          />
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              className="h-9 px-3.5 text-sm"
              onClick={() => void handleSend()}
              disabled={loading || !input.trim() || !leadId}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizontal className="h-4 w-4" />
              )}
              <span className="ml-1.5">Отправить</span>
            </Button>
          </div>
        </div>

        <SheetFooter className="border-t bg-muted/20 px-4 py-3 sm:flex-col sm:space-x-0">
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-full text-sm"
            disabled={!leadId || analyzeLoading}
            onClick={() => void handlePersistAnalyze()}
          >
            {analyzeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            <span className="ml-2">Сохранить полный анализ в CRM</span>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
