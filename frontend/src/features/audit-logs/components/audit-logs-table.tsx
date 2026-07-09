"use client";

import { useMemo, useState } from "react";
import { ColumnDef, Table as ReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnToggle } from "@/components/ui/data-table-column-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuditLogs } from "../hooks/use-audit-logs";
import type { AuditAction, AuditEntityType, AuditLogItem } from "../api/get-audit-logs";
import { useUserOptions } from "@/features/users/hooks/use-user-options";
import { toLabelMap } from "@/lib/options";

const ENTITY_LABELS: Record<string, string> = {
  Lead: "Лид",
  Client: "Клиент",
  Task: "Задача",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Изменение",
  DELETE: "Удаление",
};

export function AuditLogsTable() {
  const [entityType, setEntityType] = useState<AuditEntityType | "">("");
  const [action, setAction] = useState<AuditAction | "">("");

  const { data, isLoading } = useAuditLogs({
    page: 1,
    limit: 1000,
    entityType: entityType || undefined,
    action: action || undefined,
  });

  const { options: userOptions } = useUserOptions();

  const userMapLabel = toLabelMap(userOptions);

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return "—";
    return userMapLabel[userId] ?? "—";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = useMemo<ColumnDef<AuditLogItem>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Дата",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "entityType",
        header: "Сущность",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {ENTITY_LABELS[row.original.entityType] ?? row.original.entityType}
          </Badge>
        ),
      },
      {
        accessorKey: "action",
        header: "Действие",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.action === "DELETE"
                ? "destructive"
                : row.original.action === "CREATE"
                ? "default"
                : "outline"
            }
          >
            {ACTION_LABELS[row.original.action] ?? row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: "entityId",
        header: "ID сущности",
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.entityId.slice(0, 8)}…</span>
        ),
      },
      {
        accessorKey: "userId",
        header: "Пользователь",
        cell: ({ row }) => (
          <span className="text-sm">{getUserName(row.original.userId)}</span>
        ),
      },
      {
        id: "metadata",
        header: "Сущность",
        accessorFn: (row) => JSON.stringify(row.metadata ?? {}),
        cell: ({ row }) => (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Показать JSON
            </summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
              {row.original.metadata ? JSON.stringify(row.original.metadata, null, 2) : <>--</>}
            </pre>
          </details>
        ),
      },
    ],
    [userMapLabel]
  );

  const toolbar = (table: ReactTable<AuditLogItem>) => (
    <div className="flex flex-wrap gap-3">
      <Select
        value={entityType || "all"}
        onValueChange={(v) => {
          table.setPageIndex(0);
          if (v === "all") {
            setEntityType("");
            return;
          }
          setEntityType(v as AuditEntityType);
        }}
      >
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Тип сущности" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Все типы</SelectItem>
          <SelectItem value="Lead">Лид</SelectItem>
          <SelectItem value="Client">Клиент</SelectItem>
          <SelectItem value="Task">Задача</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={action || "all"}
        onValueChange={(v) => {
          table.setPageIndex(0);
          if (v === "all") {
            setAction("");
            return;
          }
          setAction(v as AuditAction);
        }}
      >
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue placeholder="Действие" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="all">Все действия</SelectItem>
          <SelectItem value="CREATE">Создание</SelectItem>
          <SelectItem value="UPDATE">Изменение</SelectItem>
          <SelectItem value="DELETE">Удаление</SelectItem>
        </SelectContent>
      </Select>
      <div className="ml-auto">
        <DataTableColumnToggle table={table} />
      </div>
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      isLoading={isLoading}
      skeletonRows={6}
      toolbar={toolbar}
    />
  );
}
