import { LogoutButton } from "@/components/logout-button";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>

        <nav className="space-y-2">
          <Link href="/dashboard" className="block hover:text-gray-300">
            Home
          </Link>

          <Link href="/dashboard/users" className="block hover:text-gray-300">
            Users
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
