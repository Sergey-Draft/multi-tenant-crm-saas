import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { TasksView } from "@/features/tasks/components/tasks-view";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <TitleSEO
        title="Задачи"
        description="Управление CRM-задачами: список, канбан, дедлайны, привязка к лидам и ответственные."
        canonical="/tasks"
      />
      <TasksView />
    </div>
  );
}
