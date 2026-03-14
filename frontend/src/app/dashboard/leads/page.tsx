import CreateLeadDialog from "@/features/leads/components/create-lead-dialog";
import LeadsKanban from "@/features/leads/components/leads-kanban";

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      <CreateLeadDialog />

      <LeadsKanban />
    </div>
  );
}
