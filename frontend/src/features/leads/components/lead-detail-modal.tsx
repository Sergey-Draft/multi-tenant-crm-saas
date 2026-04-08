/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  TASK_STATUS_OPTIONS,
  LEAD_STATUS_OPTIONS,
  toLabelMap,
} from "@/lib/options";
import { Calendar, User, Phone, Mail, Pencil } from "lucide-react";
import useUpdateLead from "../hooks/use-update-lead";
import { useClientOptions } from "@/features/clients/hooks/use-client-options";
import { useUserOptions } from "@/features/users/hooks/use-user-options";

const TASK_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  TODO: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
};

const LEAD_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  NEW: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
  REJECTED: "destructive",
};

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function toDateInputValue(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

interface LeadDetailModalProps {
  lead: any | null;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    assignedToId: "",
    status: "",
    dateDue: "",
  });

  const taskLabelMap = toLabelMap(TASK_STATUS_OPTIONS);
  const leadLabelMap = toLabelMap(LEAD_STATUS_OPTIONS);
  const mutation = useUpdateLead();
  const { options: clientOptions } = useClientOptions();
  const { options: userOptions } = useUserOptions();

  console.log("userOption", userOptions);

  useEffect(() => {
    if (lead) {
      setForm({
        title: lead.title ?? "",
        description: lead.description ?? "",
        clientId: lead.clientId ?? "",
        assignedToId: lead.assignedToId ?? "",
        status: lead.status ?? "NEW",
        dateDue: toDateInputValue(lead.dateDue ?? ""),
      });
      setIsEditing(false);
    }
  }, [lead]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // add value "" for API
    if (field === "assignedToId" && value === "null") {
      setForm((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    mutation.mutate(
      {
        id: lead.id,
        data: {
          title: form.title,
          description: form.description,
          clientId: form.clientId || undefined,
          assignedToId: form.assignedToId,
          status: form.status as any,
          dateDue: form.dateDue || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  if (!lead) return null;

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-start gap-4 mr-8">
            {isEditing ? (
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="text-lg font-semibold"
                placeholder="Название лида"
              />
            ) : (
              <DialogTitle className="text-lg">{lead.title}</DialogTitle>
            )}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Select
                  value={form.status}
                  onValueChange={(v) => handleSelectChange(v, "status")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant={LEAD_STATUS_VARIANT[lead.status]}>
                  {leadLabelMap[lead.status] ?? lead.status}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="space-y-6">
            {/* Клиент */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <Label className="text-xs font-medium text-muted-foreground">
                Клиент
              </Label>
              {isEditing ? (
                <Select
                  value={form.clientId}
                  onValueChange={(v) => handleSelectChange(v, "clientId")}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                lead.client && (
                  <>
                    <p className="font-medium mt-1">{lead.client.name}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      {lead.client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.client.phone}
                        </span>
                      )}
                      {lead.client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {lead.client.email}
                        </span>
                      )}
                    </div>
                  </>
                )
              )}
            </div>

            {/* Даты + ответственный */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Создан</Label>
                <p className="flex items-center gap-1 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(lead.createdAt)}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Срок</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    name="dateDue"
                    value={form.dateDue}
                    onChange={handleChange}
                    className="mt-1"
                  />
                ) : (
                  lead.dateDue && (
                    <p className="flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(lead.dateDue)}
                    </p>
                  )
                )}
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">
                  Ответственный
                </Label>
                {isEditing ? (
                  <Select
                    value={form.assignedToId}
                    onValueChange={(v) => handleSelectChange(v, "assignedToId")}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите ответственного" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Не назначен</SelectItem>
                      {userOptions?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="mt-1">
                    {lead.assignedTo ? (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {lead.assignedTo.name || lead.assignedTo.email}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Не назначен
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Описание */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Описание
              </Label>
              {isEditing ? (
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Описание лида"
                />
              ) : (
                lead.description && (
                  <p className="text-sm leading-relaxed mt-2">
                    {lead.description}
                  </p>
                )
              )}
            </div>

            {/* Задачи — только просмотр */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-3 block">
                Задачи ({lead.Task?.length ?? 0})
              </Label>
              {!lead.Task?.length ? (
                <p className="text-sm text-muted-foreground">Нет задач</p>
              ) : (
                <ul className="space-y-2">
                  {lead.Task.map((task: any) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <Badge
                        variant={TASK_STATUS_VARIANT[task.status]}
                        className="shrink-0"
                      >
                        {taskLabelMap[task.status] ?? task.status}
                      </Badge>
                      <span>{task.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {isEditing ? (
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                Сохранить
              </Button>
            </DialogFooter>
          ) : (
            <DialogFooter>
              <Button
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Редактировать
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
