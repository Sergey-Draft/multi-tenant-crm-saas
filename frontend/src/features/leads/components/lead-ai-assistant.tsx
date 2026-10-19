"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { downloadText } from "@/lib/download-text";
import {
  chatLeadAi,
  type LeadAiAction,
  type LeadAiChatMode,
  type LeadAiChatMessage,
} from "../api/chat-lead-ai";
import { analyzeLeadAi } from "../api/analyze-lead-ai";
import {
  getLatestLeadAiAnalysis,
  type LeadAiAnalysisSnapshot,
} from "../api/get-latest-lead-ai-analysis";
import { LeadAiActionCard } from "./lead-ai-action-card";
import { toast } from "sonner";
import { Copy, Database, Download, FileText, Loader2, SendHorizontal } from "lucide-react";

const MODE_OPTIONS: { value: LeadAiChatMode; label: string }[] = [
  { value: "CHAT", label: "Диалог" },
  { value: "SUMMARY", label: "Резюме" },
  { value: "NEXT_ACTION", label: "Шаг" },
  { value: "DRAFT_EMAIL", label: "Письмо" },
];

const EXAMPLES = [
  "Созвонился с клиентом: просит КП до пятницы и перезвонить в понедельник",
  "Что сделать дальше по этому лиду?",
  "Какие риски по сделке?",
];

type Row = LeadAiChatMessage & {
  id: string;
  createdAt: Date;
  actions?: LeadAiAction[];
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatAnalysisDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function replyFileName(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `ai-otvet-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.txt`;
}

function errorText(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message?: string }).message)
    : fallback;
}

export function LeadAiAssistant({ leadId, leadTitle }: { leadId: string; leadTitle?: string }) {
  const [mode, setMode] = useState<LeadAiChatMode>("CHAT");
  const [rows, setRows] = useState<Row[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<LeadAiAnalysisSnapshot | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const refreshLatestAnalysis = async () => {
    try {
      const { analysis } = await getLatestLeadAiAnalysis(leadId);
      setLatestAnalysis(analysis);
    } catch {
      setLatestAnalysis(null);
    }
  };

  useEffect(() => {
    setRows([]);
    setInput("");
    setMode("CHAT");
    setLatestAnalysis(null);
    refreshLatestAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [rows, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const nextRows: Row[] = [
      ...rows,
      { id: createMessageId(), role: "user", content: text, createdAt: new Date() },
    ];
    setInput("");
    setRows(nextRows);
    setLoading(true);

    try {
      const history = nextRows.map(({ role, content }) => ({ role, content }));
      const { reply, actions } = await chatLeadAi(leadId, { mode, messages: history });
      setRows((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: reply, createdAt: new Date(), actions },
      ]);
    } catch (err) {
      toast.error("Не удалось получить ответ", { description: errorText(err, "Ошибка сети") });
      setRows((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: "Не удалось выполнить запрос. Попробуйте ещё раз.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePersistAnalyze = async () => {
    if (analyzeLoading) return;
    setAnalyzeLoading(true);
    try {
      await analyzeLeadAi(leadId);
      toast.success("Полный анализ сохранён в историю лида");
      await refreshLatestAnalysis();
    } catch (err) {
      toast.error("Не удалось сохранить анализ", { description: errorText(err, "Ошибка") });
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const copyReply = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Скопировано");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const downloadReply = (row: Row) => {
    const header = leadTitle ? `Лид: ${leadTitle}\n` : "";
    downloadText(
      replyFileName(row.createdAt),
      `${header}Дата: ${row.createdAt.toLocaleString("ru-RU")}\n\n${row.content}\n`
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md bg-muted p-0.5">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              disabled={loading}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                mode === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 text-xs"
          disabled={analyzeLoading}
          onClick={handlePersistAnalyze}
          title="Сохранить полный анализ (резюме, шаг, письмо) в историю лида"
        >
          {analyzeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
          Анализ
        </Button>
      </div>

      {latestAnalysis && (
        <details className="mt-2 rounded-md border px-3 py-2 text-sm">
          <summary className="cursor-pointer text-xs text-muted-foreground">
            Последний разбор · {formatAnalysisDate(latestAnalysis.createdAt)}
            {latestAnalysis.usedFallback && " · упрощённый"}
          </summary>
          <div className="mt-2 max-h-60 space-y-2 overflow-y-auto leading-relaxed">
            <p><span className="font-medium">Резюме:</span> {latestAnalysis.summary}</p>
            <p><span className="font-medium">Шаг:</span> {latestAnalysis.nextAction}</p>
            <p className="whitespace-pre-wrap"><span className="font-medium">Письмо:</span> {latestAnalysis.email}</p>
          </div>
        </details>
      )}

      <div ref={listRef} className="mt-3 max-h-[55vh] min-h-40 overflow-y-auto lg:max-h-none lg:min-h-0 lg:flex-1">
        <div className="flex flex-col gap-4 pb-2">
          {rows.length === 0 && !loading && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Опишите итоги звонка или задайте вопрос — ассистент ответит и предложит задачи.
              </p>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setInput(example)}
                  className="block w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {rows.map((row) => (
            <div key={row.id} className={cn("flex flex-col gap-1.5", row.role === "user" ? "items-end" : "items-start")}>
              <span className="text-xs text-muted-foreground">
                {row.role === "user" ? "Вы" : "Ассистент"} · {formatTime(row.createdAt)}
              </span>
              <div
                className={cn(
                  "max-w-[90%] whitespace-pre-wrap wrap-break-word rounded-lg px-3 py-2 text-sm leading-relaxed",
                  row.role === "user" ? "bg-primary text-primary-foreground" : "border bg-muted/40"
                )}
              >
                {row.content}
              </div>

              {row.role === "assistant" && (
                <div className="w-full max-w-[90%] space-y-2">
                  {row.actions?.map((action, i) => (
                    <LeadAiActionCard key={i} leadId={leadId} action={action} />
                  ))}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => downloadReply(row)}
                      className="flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{replyFileName(row.createdAt)}</span>
                      <Download className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => copyReply(row.content)}
                      title="Копировать"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Ассистент пишет…
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Вопрос ассистенту…"
          rows={2}
          disabled={loading}
          className="max-h-40 min-h-11 resize-none text-sm"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          title="Отправить (Enter)"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
