"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "../hooks/use-audit-logs";
import type { AuditEntityType, AuditAction } from "../api/get-audit-logs";
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
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<AuditEntityType | "">("");
  const [action, setAction] = useState<AuditAction | "">("");

  const { data, isLoading } = useAuditLogs({
    page,
    limit: 20,
    entityType: entityType || undefined,
    action: action || undefined,
  });

  const { options: userOptions } = useUserOptions();

  const getUserName = (userId: string | null | undefined) => {
    const userMapLabel = toLabelMap(userOptions);
    if (!userId) return "Не найден";
    return userMapLabel[userId];
  };

  console.log("data", data);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
<div>
        <p className="text-base text-muted-foreground mt-0.5">Журналы событий. Используется для отслеживания изменений в системе.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Select
          value={entityType}
          onValueChange={(v) => {
            if(v === 'all') {
              setEntityType("");
              setPage(1);
              return
            }
            setEntityType(v as AuditEntityType | "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Тип сущности" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="Lead">Лид</SelectItem>
            <SelectItem value="Client">Клиент</SelectItem>
            <SelectItem value="Task">Задача</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={action}
          onValueChange={(v) => {
            if(v === 'all') {
              setAction("");
              setPage(1);
              return
            }
            setAction(v as AuditAction | "");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Действие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="CREATE">Создание</SelectItem>
            <SelectItem value="UPDATE">Изменение</SelectItem>
            <SelectItem value="DELETE">Удаление</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Сущность</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>ID сущности</TableHead>
                <TableHead>Пользователь</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Нет записей
                  </TableCell>
                </TableRow>
              ) : (
                data?.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ENTITY_LABELS[log.entityType] ?? log.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.action === "DELETE"
                            ? "destructive"
                            : log.action === "CREATE"
                            ? "default"
                            : "outline"
                        }
                      >
                        {ACTION_LABELS[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.entityId.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.userId ? log.userId.slice(0, 8) + "…" : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      { getUserName(log.userId)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {data.page} из {data.totalPages} ({data.total} записей)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
