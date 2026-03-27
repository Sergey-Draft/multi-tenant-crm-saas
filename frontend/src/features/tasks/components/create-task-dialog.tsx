"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTask } from "../hooks/use-create-task";
import { useUserOptions } from "@/features/users/hooks/use-user-options";
import useGetLeads from "@/features/leads/hooks/use-get-leads";

const EMPTY = {
  title: "",
  deadline: "",
  assignedToId: "",
  leadId: "",
};

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const { options: users } = useUserOptions();
  const { data: leads = [] } = useGetLeads();
  const mutation = useCreateTask();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        title: form.title,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        assignedToId: form.assignedToId || undefined,
        leadId: form.leadId || undefined,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить задачу</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="task-title">Заголовок</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="task-deadline">Дедлайн</Label>
              <Input
                id="task-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              />
            </Field>
            <Field>
              <Label>Ответственный</Label>
              <Select
                value={form.assignedToId || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, assignedToId: v === "none" ? "" : v }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Не назначен" />
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
              <Select
                value={form.leadId || "none"}
                onValueChange={(v) => setForm((p) => ({ ...p, leadId: v === "none" ? "" : v }))}
              >
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
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Отмена
              </Button>
            </DialogClose>
            <Button type="submit" disabled={mutation.isPending}>
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
