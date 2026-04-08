"use client";

import { useState } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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

  const totalPages = data?.totalPages ?? 0;
  const canPrev = data != null && page > 1;
  const canNext = data != null && totalPages > 0 && page < totalPages;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={entityType || "all"}
            onValueChange={(v) => {
              if (v === "all") {
                setEntityType("");
                setPage(1);
                return;
              }
              setEntityType(v as AuditEntityType);
              setPage(1);
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
              if (v === "all") {
                setAction("");
                setPage(1);
                return;
              }
              setAction(v as AuditAction);
              setPage(1);
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
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm dark:bg-card/95">
        {isLoading ? (
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
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Сущность</TableHead>
                <TableHead>Действие</TableHead>
                <TableHead>ID сущности</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Сущность</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
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
                      {getUserName(log.userId)}
                    </TableCell>
                    <TableCell className="w-[300px] min-w-[300px] max-w-[300px]">
                      {
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Показать JSON
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded overflow-auto max-h-40">
                            {log.metadata ? (
                              JSON.stringify(log.metadata, null, 2)
                            ) : (
                              <>--</>
                            )}
                          </pre>
                        </details>
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {data != null && !isLoading && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2.5 shadow-sm dark:bg-muted/50">
          <div className="text-sm text-foreground">
            {data.total} записей
            {totalPages > 1 && (
              <span className="tabular-nums">
                {" "}
                · Страница {data.page} из {totalPages}
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shrink-0"
                aria-label="Первая страница"
                onClick={() => setPage(1)}
                disabled={!canPrev}
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shrink-0"
                aria-label="Предыдущая страница"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canPrev}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shrink-0"
                aria-label="Следующая страница"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!canNext}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="shrink-0"
                aria-label="Последняя страница"
                onClick={() => setPage(totalPages)}
                disabled={!canNext}
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
