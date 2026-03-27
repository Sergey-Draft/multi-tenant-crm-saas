"use client";

import { useMemo, useState } from "react";
import { RowSelectionState, Table as ReactTable } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnToggle } from "@/components/ui/data-table-column-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import SimpleDialog from "@/components/confirmationModal/simple-modal";
import { useTasks } from "../hooks/use-tasks";
import { createTaskColumns } from "./tasks-columns";
import useGetLeads from "@/features/leads/hooks/use-get-leads";
import type { Task } from "@/types/task";
import { TaskEditModal } from "./task-edit-modal";
import { useDeleteTask } from "../hooks/use-delete-task";

export function TasksList() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: leads = [] } = useGetLeads();
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filter, setFilter] = useState("");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteTask();

  const leadById = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((lead: any) => map.set(lead.id, lead.title));
    return map;
  }, [leads]);

  const columns = useMemo(
    () =>
      createTaskColumns((leadId) => {
        if (!leadId) return "Лид";
        return leadById.get(leadId) ?? "Лид";
      }),
    [leadById]
  );

  const filtered = useMemo(() => {
    if (!filter.trim()) return tasks;
    const q = filter.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        String(t.status).toLowerCase().includes(q) ||
        (t.leadId ? (leadById.get(t.leadId) ?? "").toLowerCase().includes(q) : false)
    );
  }, [tasks, filter, leadById]);

  const selectedIds = Object.keys(rowSelection);

  const toolbar = (table: ReactTable<Task>) => (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Поиск задач..."
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
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить ({selectedIds.length})
          </Button>
        )}
        <DataTableColumnToggle table={table} />
      </div>
    </div>
  );

  const handleBulkDelete = () => {
    selectedIds.forEach((rowIndex) => {
      const task = filtered[Number(rowIndex)];
      if (task) deleteMutation.mutate(task.id);
    });
    setRowSelection({});
    setConfirmOpen(false);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        skeletonRows={6}
        toolbar={toolbar}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        onRowDoubleClick={(task) => setEditTask(task)}
      />
      <TaskEditModal task={editTask} onClose={() => setEditTask(null)} />
      <SimpleDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Удалить задачи?"
        description={`Будет удалено ${selectedIds.length} задач(а). Это действие необратимо.`}
        onSuccess={handleBulkDelete}
      />
    </>
  );
}
