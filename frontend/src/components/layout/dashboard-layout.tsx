"use client"


import { SidebarProvider } from "../ui/sidebar";
import { Header } from "./header";
import AppSidebar from "./sidebar";

// export function DashboardLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen">
//       <SidebarProvider>
//         <AppSidebar />
//       </SidebarProvider>

//       <div className="flex flex-col flex-1">
//         <Header />

//         <main className="p-6 overflow-auto">{children}</main>
//       </div>
//     </div>
//   );
// }





import { Bell, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "CRM Дашборд",
  "/dashboard/users": "Пользователи",
  "/dashboard/clients": "Клиенты",
  "/dashboard/leads": "Лиды",
  "/tasks": "Tasks",
  "/contracts": "Contracts",
  "/payments": "Payments & Costs",
  "/payments-schedule": "Payment Schedule",
  "/debt": "Accounts Receivable",
  "/groups": "Student Groups",
  "/lessons": "Lessons",
  "/class-schedule": "Class Schedule",
  "/edit-groups": "Students",
  "/schedule-view": "Topics & Dates",
  "/working-out": "Compensations",
  "/appointments": "Assignments",
  "/attendance-reports": "Attendance",
  "/access": "User Access",
  "/parents-create": "New Customer",
  "/journal": "Student Journal",
  "/reports": "Reports",
  "/settings": "Settings",
};

export default function TopBar() {
  const { user, logout} = useAuthStore();
  const pathname = usePathname()

  const pageTitle = PAGE_TITLES[pathname] || "Dashboard";

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[380px]">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Notifications</SheetTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-muted-foreground">
                    Mark all read
                  </Button>
                )}
              </div>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    n.read ? "bg-transparent" : "bg-primary/5"
                  } hover:bg-muted`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                      {n.title}
                    </p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                {user?.id}{user?.email[0]}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.id} {user?.email}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive">
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}



export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
        <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar />
            <main className="flex-1 p-6 overflow-auto scrollbar-thin">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }
