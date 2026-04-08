"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, Link2, Pencil } from "lucide-react";
import type { Task } from "@/types/task";
import { useUserOptions } from "@/features/users/hooks/use-user-options";
import { getInitials, getUserName } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  leadTitle?: string;
  onOpen?: (task: Task) => void;
}

function formatDate(value?: string | null) {
  if (!value) return "Без дедлайна";
  return new Date(value).toLocaleDateString("ru-RU");
}


const statusBorderColors = {
  TODO: "border-l-[hsl(var(--kanban-new))]",
  IN_PROGRESS: "border-l-[hsl(var(--kanban-progress))]",
  DONE: "border-l-[hsl(var(--kanban-won))]",
};

export function isTaskExpired(deadline: string | null, status: string): boolean {
  if (!deadline || status === "DONE") return false;
  return new Date(deadline).getTime() < Date.now();
}

export function TaskCard({ task, leadTitle, onOpen }: TaskCardProps) {
  const deadlinePassed = isTaskExpired(task.deadline as string, task.status)

    const borderColor =
    statusBorderColors[task?.status as keyof typeof statusBorderColors] ?? "";

    const {options: userOptions} = useUserOptions()

  return (
    <div
      onDoubleClick={() => onOpen?.(task)}
      className={`group rounded-xl border border-gray-100 border-l-4 ${borderColor} bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[15px] font-medium">{task.title}</p>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {task.leadId ? (
            <Link href={`/dashboard/leads?leadId=${task.leadId}`}>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          ) : null}
          {onOpen ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(task);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p className={`flex items-center gap-1 ${deadlinePassed ? "text-destructive" : ""}`}>
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(task.deadline)}
        </p>
        {task.leadId ? (
          <p className="flex items-center gap-1">
            <Link2 className="h-3.5 w-3.5" />
            <span className="truncate">Лид: {leadTitle ?? "Открыть лид"}</span>
          </p>
        ) : (
          <p className="italic">Без привязки к лиду</p>
        )}
      </div>

      <div className="flex justify-between mt-3 border-t border-gray-100 pt-2">

        {task.assignedToId ? (
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
            {getInitials(getUserName(task.assignedToId, userOptions))}
            </div>
            <span className="text-sm text-muted-foreground truncate min-w-0">
              {getUserName(task.assignedToId, userOptions)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Не назначен
          </span>
        )}

        <Badge variant="secondary" className="text-xs">
          {task.status}
        </Badge>
      </div>
    </div>
  );
}
