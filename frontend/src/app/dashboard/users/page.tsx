import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { UsersTable } from "@/features/users/components/users-table";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <TitleSEO
        title="Пользователи"
        description="Управление пользователями тенанта. Роли: сотрудник, менеджер, администратор, супер-админ, владелец. Создавайте, редактируйте и управляйте доступом к системе."
        canonical="/users"
      />
      <UsersTable />
    </div>
  );
}
