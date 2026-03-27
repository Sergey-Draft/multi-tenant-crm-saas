"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { TableSelectCheckbox } from "@/components/ui/table-select-checkbox";
import type { Task, TaskStatus } from "@/types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "К выполнению",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
};

function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU");
}

export function createTaskColumns(
  getLeadTitle: (leadId?: string | null) => string
): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <TableSelectCheckbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <TableSelectCheckbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Выбрать строку"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "Задача",
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === "DONE" ? "outline" : status === "IN_PROGRESS" ? "default" : "secondary";
        return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
      },
    },
    {
      accessorKey: "deadline",
      header: "Дедлайн",
      cell: ({ row }) => formatDate(row.original.deadline),
    },
    {
      accessorKey: "leadId",
      header: "Лид",
      cell: ({ row }) => {
        if (!row.original.leadId) return "Без лида";
        return (
          <Link
            href={`/dashboard/leads?leadId=${row.original.leadId}`}
            className="text-primary hover:underline"
          >
            {getLeadTitle(row.original.leadId)}
          </Link>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Создана",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];
}
