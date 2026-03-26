
import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { AuditLogsTable } from "@/features/audit-logs/components/audit-logs-table";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <TitleSEO title="Журнал аудита" description="Журнал событий. Используется для отслеживания изменений в системе." canonical="/audit-log" />
      <AuditLogsTable />
    </div>
  );
}
