

"use client"

import {
  BarChart3, BookOpen, CalendarDays, ClipboardList, Contact2,
  CreditCard, FileText, GraduationCap, LayoutDashboard, ListChecks,
  Settings, Shield, UserPlus, Users, Wallet, BookMarked, RefreshCw, UserCheck,
  ExternalLink, Code , UserRoundPen  
} from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Основные",
    items: [
      { title: "CRM Дашборд", url: "/dashboard", icon: LayoutDashboard },
      { title: "Клиенты", url: "/dashboard/clients", icon: Users },
      { title: "Пользователи", url: "/dashboard/users", icon: Users },
      { title: "Лиды", url: "/dashboard/leads", icon: ClipboardList },
    ],
  },
  {
    label: "Система/Backend",
    items: [
      { title: "Настройки", url: "/settings", icon: Settings },
      { title: "Профиль", url: "/settings/user", icon: UserRoundPen },
      { title: "Backend API", url: "/settings/backend-api", icon: Code },
    ],
  },
  {
    label: "Документация",
    items: [
      { title: "API Docs", url: "https://github.com/Sergey-Draft/multi-tenant-crm-saas/blob/main/docs/README.md", icon: FileText, external: true },
      { title: "Payments", url: "/payments", icon: CreditCard },
      { title: "Schedule", url: "/payments-schedule", icon: CalendarDays },
      { title: "Debt", url: "/debt", icon: Wallet },
    ],
  },
  {
    label: "Education",
    items: [
      { title: "Groups", url: "/groups", icon: Users,  },
      { title: "Lessons", url: "/lessons", icon: BookOpen,  },
      { title: "Class Schedule", url: "/class-schedule", icon: CalendarDays,  },
      { title: "Students", url: "/edit-groups", icon: GraduationCap,  },
      { title: "Topics", url: "/schedule-view", icon: BookMarked,  },
      { title: "Compensations", url: "/working-out", icon: RefreshCw, },
      { title: "Assignments", url: "/appointments", icon: UserCheck,  },
      { title: "Attendance", url: "/attendance-reports", icon: ClipboardList,  },
    ],
  },
  {
    label: "Users",
    items: [
      { title: "Access", url: "/access", icon: Shield,},
      { title: "New Customer", url: "/parents-create", icon: UserPlus },
      { title: "Journal", url: "/journal", icon: Contact2 },
    ],
  },
];

/** Все внутренние URL — чтобы не подсвечивать /dashboard на /dashboard/clients и /settings на /settings/user */
const ALL_NAV_URLS = NAV_SECTIONS.flatMap((s) =>
  s.items.filter((i) => !i.external).map((i) => i.url)
);

function isNavItemActive(pathname: string, itemUrl: string): boolean {
  if (pathname === itemUrl) return true;
  if (!pathname.startsWith(itemUrl + "/")) return false;
  const hasMoreSpecific = ALL_NAV_URLS.some(
    (u) =>
      u !== itemUrl &&
      u.startsWith(itemUrl + "/") &&
      (pathname === u || pathname.startsWith(u + "/"))
  );
  return !hasMoreSpecific;
}

export default function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center font-bold text-sidebar-primary-foreground text-sm shrink-0">
            D
          </div>
          {state !== "collapsed" && (
            <span className="font-semibold text-sidebar-primary-foreground text-lg tracking-tight">
              Draft
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        {NAV_SECTIONS.map((section) => {

          return (
            <SidebarGroup key={section.label}>
              {state !== "collapsed" && (
                <SidebarGroupLabel className="text-sidebar-muted text-[11px] uppercase tracking-wider font-medium px-3">
                  {section.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={!item.external && isNavItemActive(pathname, item.url)}
                      >
                        {item.external ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gap-3 rounded-md px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {state !== "collapsed" && (
                              <span className="flex items-center gap-1.5">
                                {item.title}
                                <ExternalLink className="h-3 w-3 text-muted-foreground/60" />
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={item.url}
                            className="gap-3 rounded-md px-3 py-2 text-sm transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {state !== "collapsed" && <span>{item.title}</span>}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {state !== "collapsed" && user && (
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-semibold shrink-0">
              {(user.name?.[0] ?? user.email?.[0] ?? "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{user.role}</p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}