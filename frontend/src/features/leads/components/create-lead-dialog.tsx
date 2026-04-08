"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { useClientOptions } from "@/features/clients/hooks/use-client-options";
import { useUserOptions } from "@/features/users/hooks/use-user-options";
import useCreateLead from "../hooks/use-create-lead";

interface CreateLeadDialogProps {
  onSuccess?: () => void; // опционально, если нужно обновить список после добавления
}


export type LeadStatus = 'NEW' | 'IN_PROGRESS' | 'DONE' | 'REJECTED' 

interface LeadFormState {
    title: string;
    description: string;
    clientId: string;
    assignedToId: string;
    status: LeadStatus | null; // или LeadStatus, если всегда нужно значение
    dateDue: string;
  }

const statusOptions = [
  { value: "NEW", label: "Новый" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Готово" },
  { value: "REJECTED", label: "Отклонён" },
];

const roleOptions = [
  { value: "OWNER", label: "Владелец" },
  { value: "SUPER_ADMIN", label: "Супер Админ" },
  { value: "ADMIN", label: "Администратор" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "EMPLOYEE", label: "Сотрудник" },
];

export default function CreateLeadDialog({ onSuccess }: CreateLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const initialState = {
    title: "",
    description: "",
    clientId: "",
    assignedToId: "",
    status: null,
    dateDue: "",
  }
  const [newLead, setNewLead] = useState<LeadFormState>(initialState);

  const {options: clientOptions} = useClientOptions()
  const {options: userOptions} = useUserOptions()

    const mutation = useCreateLead();

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({ ...prev, [name]: value }));
  };

  const handleClientSelectChange = (value: string, field: string) => {
    console.log(value)
    setNewLead(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await mutation.mutateAsync(newLead);
      setOpen(false);
      setNewLead(initialState);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create client:", error);

    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить Лид</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader >
            <DialogTitle>Добавить лид</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                name="title"
                value={newLead.title}
                onChange={handleClientChange}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                name="description"
                type="textarea"
                value={newLead.description}
                onChange={handleClientChange}
                required
              />
            </Field>

            <Field>
              <Label htmlFor="client">Клиент</Label>
              <Select
                value={newLead.clientId}
                onValueChange={(value) => handleClientSelectChange(value, 'clientId')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="manager">Ответственный</Label>
              <Select
                value={newLead.assignedToId}
                onValueChange={(value) => handleClientSelectChange(value, 'assignedToId')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите ответственного" />
                </SelectTrigger>
                <SelectContent>
                  {userOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="client">Статус</Label>
              <Select
                value={newLead.status as LeadStatus}
                onValueChange={(value) => handleClientSelectChange(value, 'status')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
            <Button
              type="submit"
              //   disabled={createClient.isPending}
            >
              Сохранить
              {/* {createClient.isPending ? "Сохранение..." : "Сохранить"} */}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
