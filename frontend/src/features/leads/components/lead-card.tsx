"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Phone,
  ClipboardList,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const statusBorderColors = {
  NEW: "border-l-[hsl(var(--kanban-new))]",
  IN_PROGRESS: "border-l-[hsl(var(--kanban-progress))]",
  DONE: "border-l-[hsl(var(--kanban-won))]",
  REJECTED: "border-l-[hsl(var(--kanban-lost))]",
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date();
}

interface LeadCardProps {
  lead: any;
  onOpen?: (lead: any) => void;
}

const LeadCard = ({ lead, onOpen }: LeadCardProps) => {
  const borderColor =
    statusBorderColors[lead?.status as keyof typeof statusBorderColors] ?? "";

  const overdue =
    lead?.dateDue &&
    lead?.status !== "DONE" &&
    lead?.status !== "REJECTED" &&
    isOverdue(lead.dateDue);

  const assignedName =
    lead?.assignedTo?.name || lead?.assignedTo?.email || null;

  return (
    <div
      onDoubleClick={() => onOpen?.(lead)}
      className={`
        group bg-white rounded-xl shadow-sm
        border border-gray-100 border-l-4
        p-4 mb-3 flex flex-col gap-2
        h-[240px] min-w-0 overflow-hidden
        transition-all duration-200
        cursor-pointer hover:-translate-y-0.5 hover:shadow-md
        ${borderColor}
      `}
    >
      {/* Заголовок + кнопка открытия */}
      <div className="flex items-start justify-between gap-2 shrink-0 min-w-0">
        <p className="font-medium text-[16px] leading-snug truncate min-w-0 flex-1">
          {lead?.title}
        </p>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onOpen?.(lead);
          }}
          title="Открыть лид"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      {/* 1. Клиент + телефон */}
      {lead?.client && (
        <div className="flex items-start justify-between gap-2 shrink-0 min-w-0">
          <span
            className="text-[14px] text-blue-400 font-medium min-w-0 line-clamp-2 break-words"
            title={lead.client.name}
          >
            {lead.client.name}
          </span>
          {lead.client.phone && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground shrink-0 min-w-0 max-w-[50%] truncate">
              <Phone className="h-3 w-3 shrink-0" />
              {lead.client.phone}
            </span>
          )}
        </div>
      )}

      {/* 2. Дата создания + срок */}
      <div className="flex flex-col items-start gap-0.5 text-[14px] text-muted-foreground shrink-0 min-w-0">
        <div className="flex flex-col items-start min-w-0 w-full">
          <span className="flex items-center gap-1 min-w-0 truncate">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            Создан: {formatDate(lead?.createdAt)}
          </span>

          {lead?.dateDue && (
            <span
              className={`flex items-center gap-1 min-w-0 truncate ${
                overdue ? "text-red-500 font-medium" : ""
              }`}
            >
              {overdue && <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
              {!overdue && <Calendar className="h-3.5 w-3.5 shrink-0" />}
              Дедлайн: {formatDate(lead.dateDue)}
            </span>
          )}
        </div>
      </div>

      {/* 3. Описание — занимает оставшееся место, обрезка с троеточием */}
      <div className="flex-1 min-h-0">
        {lead?.description ? (
          <p   className="text-[16px] font-medium text-gray-600 leading-relaxed overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}>
            {lead.description}
          </p>
        ) : (
          <div className="h-full" />
        )}
      </div>

      {/* 4. Назначен + 5. Задачи — фиксированная высота */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 h-10 shrink-0 min-w-0">
        {assignedName ? (
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              {getInitials(assignedName)}
            </div>
            <span className="text-sm text-muted-foreground truncate min-w-0">
              {assignedName}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground italic">
            Не назначен
          </span>
        )}

        {lead?.Task?.length > 0 && (
          <Badge variant="secondary" className="text-xs gap-1 px-2 shrink-0">
            <ClipboardList className="h-3 w-3" />
            {lead.Task.length} {lead.Task.length === 1 ? "задача" : "задачи"}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
