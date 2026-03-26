"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TableSelectCheckbox } from "@/components/ui/table-select-checkbox";
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { toLabelMap, USER_ROLE_OPTIONS } from "@/lib/options";

const ROLE_LABELS = toLabelMap(USER_ROLE_OPTIONS);

function formatCreatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function createUserColumns(
  onDetails: (user: User) => void
): ColumnDef<User>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <TableSelectCheckbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Выбрать все"
        />
      ),
      cell: ({ row }) => (
        <TableSelectCheckbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Выбрать строку"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Имя",
      cell: ({ row }) => row.original.name || "—",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Роль",
      cell: ({ row }) =>
        ROLE_LABELS[row.original.role] ?? row.original.role,
    },
    {
      accessorKey: "createdAt",
      header: "Создан",
      cell: ({ row }) => formatCreatedAt(row.original.createdAt),
    },
    {
      id: "details",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDetails(row.original);
          }}
        >
          Подробнее
        </Button>
      ),
    },
  ];
}
