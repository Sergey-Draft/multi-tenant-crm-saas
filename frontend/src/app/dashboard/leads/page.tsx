import { TitleSEO } from "@/components/titleSEO/title-SEO";
import CreateLeadDialog from "@/features/leads/components/create-lead-dialog";
import LeadsKanban from "@/features/leads/components/leads-kanban";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <TitleSEO
        title="Канбан Лиды"
        description="Канбан-доска для управления лидами. Добавляйте, редактируйте и перемещайте лиды по статусам."
        canonical="/leads"
      />
      <CreateLeadDialog />
      <LeadsKanban />
    </div>
  );
}
