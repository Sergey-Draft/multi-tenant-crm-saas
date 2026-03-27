"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TasksList } from "./tasks-list";
import { TasksKanban } from "./tasks-kanban";
import { CreateTaskDialog } from "./create-task-dialog";

export function TasksView() {
  return (
    <Tabs defaultValue="list" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="list">Список</TabsTrigger>
          <TabsTrigger value="kanban">Канбан</TabsTrigger>
        </TabsList>
        <CreateTaskDialog />
      </div>
      <TabsContent value="list">
        <TasksList />
      </TabsContent>
      <TabsContent value="kanban">
        <TasksKanban />
      </TabsContent>
    </Tabs>
  );
}
