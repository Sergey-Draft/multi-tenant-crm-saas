"use client";

import { useMemo, useState } from "react";
import SimpleDialog from "@/components/confirmationModal/simple-modal";
import { useTasks } from "../hooks/use-tasks";
import { useChangeTaskStatus } from "../hooks/use-change-task-status";
import { TaskCard } from "./task-card";
import useGetLeads from "@/features/leads/hooks/use-get-leads";
import { TaskEditModal } from "./task-edit-modal";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/types/task";

const COLUMNS: { status: TaskStatus; label: string; colorClass: string }[] = [
  { status: "TODO", label: "К выполнению", colorClass: "bg-kanban-new" },
  { status: "IN_PROGRESS", label: "В работе", colorClass: "bg-kanban-progress" },
  { status: "DONE", label: "Готово", colorClass: "bg-kanban-won" },
];

export function TasksKanban() {
  const { data: tasks = [] } = useTasks();
  const { data: leads = [] } = useGetLeads();
  const mutation = useChangeTaskStatus();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{ id: string; status: TaskStatus } | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const leadTitleMap = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((lead: any) => map.set(lead.id, lead.title));
    return map;
  }, [leads]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("id", id);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const id = e.dataTransfer.getData("id");
    setPending({ id, status });
    setOpen(true);
  };

  const onConfirm = () => {
    if (!pending) return;
    mutation.mutate({ id: pending.id, status: pending.status });
    setPending(null);
    setOpen(false);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {COLUMNS.map((column) => (
        <div
          key={column.status}
          className="flex w-[20vw] min-w-[260px] max-w-[320px] shrink-0 flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          <div className="mb-3 ml-2 flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${column.colorClass}`} />
            <h3 className="text-lx font-semibold text-foreground">{column.label.toUpperCase()}</h3>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-muted-foreground">
              {tasks.filter((t) => t.status === column.status).length}
            </span>
          </div>
          <div className="min-h-[80vh] flex-1 space-y-2 rounded-lg bg-muted/60 p-2">
            {tasks
              .filter((t) => t.status === column.status)
              .map((task) => (
                <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)}>
                  <TaskCard
                    task={task}
                    leadTitle={task.leadId ? leadTitleMap.get(task.leadId) : undefined}
                    onOpen={setEditTask}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}

      <SimpleDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Подтвердите действие"
        description="Изменить статус задачи?"
        onSuccess={onConfirm}
      />
      <TaskEditModal task={editTask} onClose={() => setEditTask(null)} />
    </div>
  );
}
