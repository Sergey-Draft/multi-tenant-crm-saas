"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { ImportJobRow } from "../api/import-jobs";

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

function formatTime(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("ru-RU");
}

export function createImportJobsColumns(): ColumnDef<ImportJobRow>[] {
  return [
    {
      accessorKey: "id",
      header: "Задача #",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      header: "Название",
    },
    {
      accessorKey: "state",
      header: "Статус",
      cell: ({ row }) => (
        <Badge variant={statusBadgeVariant(row.original.state)}>
          {statusLabel(row.original.state)}
        </Badge>
      ),
    },
    {
      id: "progress",
      header: "Прогресс",
      accessorFn: (row) => row.progress?.percent ?? 0,
      cell: ({ row }) => `${row.original.progress?.percent ?? 0}%`,
    },
    {
      accessorKey: "attemptsMade",
      header: "Попытки",
    },
    {
      id: "createdAt",
      header: "Создана",
      accessorFn: (row) => row.createdAt,
      cell: ({ row }) => formatTime(row.original.createdAt),
    },
    {
      id: "finishedOn",
      header: "Завершена",
      accessorFn: (row) => row.finishedOn ?? 0,
      cell: ({ row }) => formatTime(row.original.finishedOn),
    },
  ];
}
