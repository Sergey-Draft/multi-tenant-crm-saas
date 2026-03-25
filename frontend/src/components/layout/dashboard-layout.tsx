"use client"

import { SidebarProvider } from "../ui/sidebar"
import AppSidebar from "./sidebar"
import { Bell, LogOut, User, Building2, ChevronDown } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/features/auth/store/auth.store"
import { useCompany } from "@/features/companies/hooks/use-company"
import { useCompanies } from "@/features/companies/hooks/use-companies"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardTitleArea } from "./dashboard-breadcrumbs"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "CRM Дашборд",
  "/dashboard/users": "Пользователи",
  "/dashboard/clients": "Клиенты",
  "/dashboard/leads": "Лиды",
  "/dashboard/audit-logs": "Журнал аудита",
  "/tasks": "Задачи",
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
  "/settings": "Настройки",
  "/settings/user": "Профиль",
  "/settings/backend-api": "Backend API",
  "/documentation": "API Docs",
}

// ─── Company Widget ─────────────────────────────────────────────────────────

function CompanyWidget() {
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = user?.role === "SUPER_ADMIN"

  const { data: currentCompany, isLoading: companyLoading } = useCompany(user?.companyId)
  const { data: allCompanies } = useCompanies()

  const companyName = currentCompany?.name ?? (companyLoading ? null : user?.companyId ?? "—")

  if (isSuperAdmin) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-sm font-normal text-foreground/80 hover:text-foreground px-2"
          >
            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {companyLoading ? (
              <Skeleton className="h-3.5 w-24" />
            ) : (
              <span className="max-w-[160px] truncate">{companyName}</span>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Все компании
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allCompanies?.map((c) => (
            <DropdownMenuItem key={c.id} className="gap-2">
              {/* <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> */}
              <div className="flex flex-col min-w-0">
                <span className="text-sm truncate">{c.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate">{c.id}</span>
              </div>
              {c.id === user?.companyId && (
                <span className="ml-auto text-[10px] text-primary font-medium">текущая</span>
              )}
            </DropdownMenuItem>
          ))}
          {(!allCompanies || allCompanies.length === 0) && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">Нет данных</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center gap-1.5 px-2 h-8 text-sm text-foreground/80">
      <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      {companyLoading ? (
        <Skeleton className="h-3.5 w-24" />
      ) : (
        <span className="max-w-[160px] truncate">{companyName}</span>
      )}
    </div>
  )
}

// ─── Top Bar ────────────────────────────────────────────────────────────────

export default function TopBar() {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()

  const pageTitle = PAGE_TITLES[pathname] || "Dashboard"
  const userInitial = user?.name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"

  return (
    <header className="min-h-14 border-b border-border bg-card flex items-center justify-between gap-4 px-4 py-2.5 shrink-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
        <div className="min-w-0 flex-1">
          <DashboardTitleArea pathname={pathname} fallbackTitle={pageTitle} />
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Company */}
        <CompanyWidget />

        <div className="w-px h-4 bg-border mx-1" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-sm font-normal text-foreground/80 hover:text-foreground px-2"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-semibold shrink-0">
                {userInitial}
              </div>
              <span className="max-w-[140px] truncate">{user?.email ?? "—"}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-2 py-2 space-y-0.5">
              <p className="text-sm font-medium truncate">{user?.name ?? user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              {user?.role && (
                <p className="text-[10px] text-primary font-medium uppercase tracking-wide">{user.role}</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer" asChild>
              <a href="/settings/user">
                <User className="h-4 w-4" /> Настройки
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Bell — placeholder */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

// ─── Dashboard Layout ───────────────────────────────────────────────────────

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto scrollbar-thin">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
