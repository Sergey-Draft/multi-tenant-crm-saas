"use client";

import { useMemo, useState } from "react";
import { RowSelectionState, Table as ReactTable } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnToggle } from "@/components/ui/data-table-column-toggle";
import { Input } from "@/components/ui/input";

import useUsers from "../hooks/use-users";
import { createUserColumns } from "./users-columns";
import { CreateUserDialog } from "./create-user-dialog";
import { UserDetailModal } from "./user-detail-modal";
import { UserEditModal } from "./user-edit-modal";
import type { User } from "@/types/user";

export function UsersTable() {
  const { data, isLoading } = useUsers();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filter, setFilter] = useState("");
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const columns = useMemo(
    () =>
      createUserColumns((u) => setDetailUserId(u.id)),
    []
  );

  const filteredData = useMemo(() => {
    const rows: User[] = data ?? [];
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter((u) => {
      const roleStr = String(u.role).toLowerCase();
      return (
        (u.name?.toLowerCase().includes(q) ?? false) ||
        u.email.toLowerCase().includes(q) ||
        roleStr.includes(q)
      );
    });
  }, [data, filter]);

  const toolbar = (table: ReactTable<User>) => (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Поиск по имени, email, роли..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <CreateUserDialog />
        <DataTableColumnToggle table={table} />
      </div>
    </div>
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        skeletonRows={6}
        toolbar={toolbar}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(u) => setEditUser(u)}
      />

      <UserDetailModal
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />

      <UserEditModal user={editUser} onClose={() => setEditUser(null)} />
    </>
  );
}
