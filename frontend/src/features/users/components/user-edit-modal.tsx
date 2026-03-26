/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import useUpdateUser from "../hooks/use-update-user";
import type { User } from "@/types/user";

interface UserEditModalProps {
  user: User | null;
  onClose: () => void;
}

export function UserEditModal({ user, onClose }: UserEditModalProps) {
  const [form, setForm] = useState({ name: "", email: "" });
  const mutation = useUpdateUser();

  useEffect(() => {
    if (user) {
      setForm({ name: user.name ?? "", email: user.email ?? "" });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    mutation.mutate(
      { id: user.id, data: { name: form.name, email: form.email } },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={Boolean(user)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="edit-user-name">Имя</Label>
              <Input
                id="edit-user-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
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
