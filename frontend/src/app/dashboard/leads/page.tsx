import { Suspense } from "react";
import { TitleSEO } from "@/components/titleSEO/title-SEO";
import CreateLeadDialog from "@/features/leads/components/create-lead-dialog";
import LeadsKanban from "@/features/leads/components/leads-kanban";

function LeadsKanbanFallback() {
  return (
    <div
      className="min-h-[80vh] w-full animate-pulse rounded-lg bg-muted/40"
      aria-hidden
    />
  );
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <TitleSEO
        title="Канбан Лиды"
        description="Канбан-доска для управления лидами. Добавляйте, редактируйте и перемещайте лиды по статусам."
        canonical="/leads"
      />
      <CreateLeadDialog />
      <Suspense fallback={<LeadsKanbanFallback />}>
        <LeadsKanban />
      </Suspense>
    </div>
  );
}
