/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { useQueryClient } from "@tanstack/react-query";
import type { ImportJobRow } from "@/features/import-jobs/api/import-jobs";
import { ImportJobsTable } from "@/features/import-jobs/components/import-jobs-table";
import {
  useImportJobById,
  useImportJobs,
  useQueueMetrics,
  useStartDemoImport,
  useSystemStatus,
} from "@/features/import-jobs/hooks/use-import-jobs-dashboard";

function formatTime(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("ru-RU");
}

function statusLabel(state: string) {
  if (state === "completed") return "Завершено";
  if (state === "failed") return "Ошибка";
  if (state === "active") return "В работе";
  if (state === "waiting") return "В очереди";
  if (state === "delayed") return "Отложено";
  return state;
}

function statusBadgeVariant(state: string): "default" | "secondary" | "outline" | "destructive" {
  if (state === "completed") return "default";
  if (state === "failed") return "destructive";
  if (state === "active") return "secondary";
  return "outline";
}

export default function BackendJobsPage() {
  const queryClient = useQueryClient();
  const [lastLiveJob, setLastLiveJob] = useState<ImportJobRow | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: system } = useSystemStatus();
  const { data: metrics } = useQueueMetrics();
  const { data: jobs } = useImportJobs();
  const { data: selectedJobFromApi } = useImportJobById(selectedJobId);
  const startDemoImport = useStartDemoImport();
  const sortedJobs = useMemo(
    () => [...(jobs ?? [])].sort((a, b) => b.createdAt - a.createdAt),
    [jobs],
  );

  const isAnyInProgress = useMemo(
    () => sortedJobs.some((job) => job.state === "waiting" || job.state === "active"),
    [sortedJobs],
  );
  const liveJob = useMemo(
    () =>
      sortedJobs.find((job) => job.state === "active") ??
      sortedJobs.find((job) => job.state === "waiting") ??
      null,
    [sortedJobs],
  );
  useEffect(() => {
    if (liveJob) setLastLiveJob(liveJob);
  }, [liveJob]);

  const selectedJob = useMemo(() => {
    if (selectedJobFromApi) return selectedJobFromApi;
    if (selectedJobId) return sortedJobs.find((job) => job.id === selectedJobId) ?? null;
    return null;
  }, [selectedJobFromApi, selectedJobId, sortedJobs]);

  const latestJob = sortedJobs[0] ?? null;
  const displayJob = selectedJob ?? liveJob ?? latestJob ?? lastLiveJob;

  const handleStartDemo = async () => {
    const response = await startDemoImport.mutateAsync();
    setSelectedJobId(response.job.id);
    void queryClient.invalidateQueries({ queryKey: ["imports-jobs"] });
    void queryClient.invalidateQueries({ queryKey: ["imports-queue-metrics"] });
  };

  return (
    <div className="mx-auto space-y-6">
      <TitleSEO
        title="Фоновые задачи"
        description="Мониторинг Redis, worker и фоновых import jobs"
        canonical="/settings/backend-jobs"
      />

      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold">Импорт лидов </p>
            <p className="text-sm text-muted-foreground">
              Тест фоновой обработки через BullMQ/Redis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              // variant="outline"
              // disabled
            >
              Импорт CSV 
            </Button>
            <Button
              onClick={handleStartDemo}
              disabled={startDemoImport.isPending || isAnyInProgress}
            >
              {startDemoImport.isPending ? "Запуск..." : "Запустить демо-импорт"}
            </Button>
          </div>
        </div>
        <div className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {displayJob ? `Задача #${displayJob.id}` : "Задач пока нет"}
            </p>
            <span className="text-sm text-muted-foreground">
              {displayJob ? `${displayJob.progress?.percent ?? 0}%` : "0%"}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${displayJob?.progress?.percent ?? 0}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>Статус: {displayJob ? statusLabel(displayJob.state) : "Ожидание"}</span>
            <span>Обработано: {displayJob?.progress?.processed ?? 0}</span>
            <span>Создано: {displayJob?.progress?.created ?? 0}</span>
            <span>Дубликаты: {displayJob?.progress?.duplicates ?? 0}</span>
            <span>Ошибки: {displayJob?.progress?.errors ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-base font-semibold">Redis</p>
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                system?.redis.online ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <p
              className={`text-sm font-semibold ${
                system?.redis.online ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {system?.redis.online ? "Онлайн" : "Оффлайн"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Задержка: {system?.redis.latencyMs ?? "—"} ms
            </span>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-3">
          <p className="text-base font-semibold">Worker</p>
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                system?.worker.online ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
            <p
              className={`text-sm font-semibold ${
                system?.worker.online ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {system?.worker.online ? "Онлайн" : "Оффлайн"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Последний heartbeat: {formatTime(system?.worker.lastHeartbeatAt ?? null)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 space-y-3">
        <p className="text-base font-semibold">Метрики очереди</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">В очереди</p>
            <p className="text-lg font-semibold">{metrics?.waiting ?? 0}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">В работе</p>
            <p className="text-lg font-semibold">{metrics?.active ?? 0}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Завершено</p>
            <p className="text-lg font-semibold">{metrics?.completed ?? 0}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Ошибки</p>
            <p className="text-lg font-semibold">{metrics?.failed ?? 0}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Отложено</p>
            <p className="text-lg font-semibold">{metrics?.delayed ?? 0}</p>
          </div>
        </div>
      </div>

      <ImportJobsTable data={sortedJobs} isLoading={!jobs} />
    </div>
  );
}
