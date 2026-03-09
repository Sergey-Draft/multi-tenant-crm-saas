import CreateUser from "@/features/users/components/create-user";
import UsersList from "@/features/users/components/users-list";

export default function UsersPage() {
  return (
    <div className="flex jc-center gap-8">
      <div>Users page</div>
      <UsersList />
      <CreateUser />
    </div>
  );
}
