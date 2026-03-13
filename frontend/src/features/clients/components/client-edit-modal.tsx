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
import useUpdateClient from "../hooks/use-update-client";
import { Client } from "./clients-columns";

interface ClientEditModalProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientEditModal({ client, onClose }: ClientEditModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const mutation = useUpdateClient();

  useEffect(() => {
    if (client) {
      setForm({ name: client.name, email: client.email, phone: client.phone });
    }
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    mutation.mutate(
      { id: client.id, data: form },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Редактировать клиента</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Field>
            <Field>
              <Label htmlFor="edit-phone">Телефон</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
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
