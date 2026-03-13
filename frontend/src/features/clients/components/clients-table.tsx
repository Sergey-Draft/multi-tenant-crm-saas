"use client";

import { useMemo, useState } from "react";
import { RowSelectionState, Table as ReactTable } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnToggle } from "@/components/ui/data-table-column-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import UseClients from "../hooks/use-clients";
import useDeleteClient from "../hooks/use-delete-client";
import { createClientColumns, Client } from "./clients-columns";
import { CreateClientDialog } from "./create-client-dialog";
import { ClientDetailModal } from "./client-detail-modal";
import { ClientEditModal } from "./client-edit-modal";

export function ClientsTable() {
  const { data, isLoading } = UseClients();
  const deleteMutation = useDeleteClient();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filter, setFilter] = useState("");
  const [detailClientId, setDetailClientId] = useState<string | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const columns = useMemo(
    () => createClientColumns((client) => setDetailClientId(client.id)),
    []
  );

  const filteredData = useMemo(() => {
    const rows: Client[] = data || [];
    if (!filter.trim()) return rows;
    const q = filter.toLowerCase();
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
    );
  }, [data, filter]);

  const selectedIds = Object.keys(rowSelection);

  const handleConfirmDelete = () => {
    selectedIds.forEach((rowIndex) => {
      const client = filteredData[Number(rowIndex)];
      if (client) deleteMutation.mutate(client.id);
    });
    setRowSelection({});
    setConfirmOpen(false);
  };

  const toolbar = (table: ReactTable<Client>) => (
    <div className="flex items-center gap-3">
      <Input
        placeholder="Поиск клиентов..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-xs"
      />

      <div className="ml-auto flex items-center gap-2">
        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить ({selectedIds.length})
          </Button>
        )}
        <CreateClientDialog />
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
        onRowDoubleClick={(client) => setEditClient(client)}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить клиентов?</AlertDialogTitle>
            <AlertDialogDescription>
              Будет удалено {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "клиент" : "клиента(-ов)"}. Это
              действие необратимо.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ClientDetailModal
        clientId={detailClientId}
        onClose={() => setDetailClientId(null)}
      />

      <ClientEditModal
        client={editClient}
        onClose={() => setEditClient(null)}
      />
    </>
  );
}
