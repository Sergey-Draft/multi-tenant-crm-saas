/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskStatus } from "@/types/task";
import { useUpdateTask } from "../hooks/use-update-task";
import { useUserOptions } from "@/features/users/hooks/use-user-options";
import useGetLeads from "@/features/leads/hooks/use-get-leads";

interface TaskEditModalProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const [form, setForm] = useState({
    title: "",
    deadline: "",
    status: "TODO" as TaskStatus,
    assignedToId: "",
    leadId: "",
  });
  const mutation = useUpdateTask();
  const { options: users } = useUserOptions();
  const { data: leads = [] } = useGetLeads();

  useEffect(() => {
    if (!task) return;
    setForm({
      title: task.title ?? "",
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : "",
      status: task.status,
      assignedToId: task.assignedToId ?? "",
      leadId: task.leadId ?? "",
    });
  }, [task]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    mutation.mutate(
      {
        id: task.id,
        data: {
          title: form.title,
          status: form.status,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
          assignedToId: form.assignedToId || undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="edit-task-title">Заголовок</Label>
              <Input
                id="edit-task-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </Field>
            <Field>
              <Label>Статус</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">К выполнению</SelectItem>
                  <SelectItem value="IN_PROGRESS">В работе</SelectItem>
                  <SelectItem value="DONE">Готово</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="edit-task-deadline">Дедлайн</Label>
              <Input
                id="edit-task-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              />
            </Field>
            <Field>
              <Label>Ответственный</Label>
              <Select
                value={form.assignedToId || "none"}
                onValueChange={(v) => setForm((p) => ({ ...p, assignedToId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не назначен</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <Label>Лид</Label>
              <Select value={form.leadId || "none"} disabled>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Без лида" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без лида</SelectItem>
                  {leads.map((lead: any) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
