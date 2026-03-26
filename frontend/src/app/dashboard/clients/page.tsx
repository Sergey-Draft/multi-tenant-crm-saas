import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { ClientsTable } from "@/features/clients/components/clients-table";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <TitleSEO
        title="Клиенты"
        description="Управление клиентской базой. Создавайте, редактируйте и просматривайте информацию о клиентах."
        canonical="/clients"
      />
      <ClientsTable />
    </div>
  );
}
