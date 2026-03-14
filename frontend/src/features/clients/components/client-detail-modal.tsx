"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useClient } from "../hooks/use-client";

const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
  REJECTED: "Отклонён",
};


const LEAD_STATUS_COLORS: Record<
string,string> = {
  NEW: "bg-blue-50 text-blue-700  dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS: "bg-red-50 text-red-700 dark:bg-sky-950 dark:text-sky-300",
  DONE: "bg-green-100 text-kanban-won dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-gray-200 text-kanban-lost dark:bg-red-950 dark:text-red-300", 
};

interface ClientDetailModalProps {
  clientId: string | null;
  onClose: () => void;
}

export function ClientDetailModal({
  clientId,
  onClose,
}: ClientDetailModalProps) {
  const { data: client, isLoading } = useClient(clientId);

  return (
    <Dialog open={!!clientId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : (
              client?.name ?? "Клиент"
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20">Email</span>
                <span>{client?.email}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground w-20">Телефон</span>
                <span>{client?.phone || "—"}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">
                Лиды ({client?.leads?.length ?? 0})
              </p>

              {client?.leads?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет лидов</p>
              ) : (
                <ul className="space-y-2">
                  {client?.leads?.map((lead: any) => (
                    <li
                      key={lead.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span>{lead.title}</span>
                      {/* <Badge variant={LEAD_STATUS_VARIANT[lead.status]} className = {LEAD_STATUS_VARIANT[lead.status]} >
                        {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                      </Badge> */}
                      <Badge className = {LEAD_STATUS_COLORS[lead.status]} >
                        {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
