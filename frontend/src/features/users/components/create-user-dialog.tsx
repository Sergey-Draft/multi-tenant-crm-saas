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
import type { CreateUserDto, UserRole } from "@/types/user";
import useCreateUser from "../hooks/use-create-user";
import { USER_ROLE_OPTIONS } from "@/lib/options";

const initialState = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE" as UserRole,
};

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialState);
  const mutation = useCreateUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateUserDto = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    };
    mutation.mutate(data, {
      onSuccess: () => {
        setForm(initialState);
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить пользователя</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новый пользователь</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="new-user-name">Имя</Label>
              <Input
                id="new-user-name"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                required
                minLength={2}
              />
            </Field>
            <Field>
              <Label htmlFor="new-user-email">Email</Label>
              <Input
                id="new-user-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                required
              />
            </Field>
            <Field>
              <Label htmlFor="new-user-password">Пароль</Label>
              <Input
                id="new-user-password"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                required
                minLength={6}
              />
            </Field>
            <Field>
              <Label>Роль</Label>
              <Select
                value={form.role}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, role: v as UserRole }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
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
