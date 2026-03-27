"use client";

import { useStats } from "@/features/dashboard/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { TitleSEO } from "@/components/titleSEO/title-SEO";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";

const LEAD_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  NEW: "secondary",
  IN_PROGRESS: "default",
  DONE: "outline",
  REJECTED: "destructive",
};

const LEAD_STATUS_LABEL: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  DONE: "Готово",
  REJECTED: "Отклонён",
};

const cardGradients = {
  clients: "gradient-to-br from-[#4099ff] to-[#97bfed]",
  leadsWork: "gradient-to-br from-[#2ed8b6] to-[#6cedd3]",
  leadsClose: "gradient-to-br from-[#FFB64D] to-[#efcd9c]",
  tasks: "gradient-to-br from-[#8e44ad] to-[#c39bd3]",
};

// KPI-карточка: иконка + число + подпись
function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  bg,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  isLoading: boolean;
  bg?: string;
}) {
  return (
    <Card
      className={`bg-${bg} transition-all duration-300 ease-out hover:shadow-xl hover:translate-y-[-2px]`}
    >
      <CardHeader className="flex flex-row items-center justify-between h-[20%] text-center">
        <CardTitle className="text-[18px] font-bold text-white ">
          {title}
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="flex flex-row items-center justify-between">
            <Icon className="h-8 w-8 text-muted-foreground" color="white" />
            <p className="text-3xl font-bold text-white">{value ?? 0}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type LeadItem = {
  label: string;
  count: number;
};

const COLORS = [
  ["#4099ff", "#97bfed"],
  ["#2ed8b6", "#6cedd3"],
  ["#FFB64D", "#efcd9c"], 
  ["#8e44ad", "#c39bd3"],
];

export function LeadsProgress({ data }: { data?: LeadItem[] }) {
  const total = useMemo(() => {
    return data?.reduce((acc, item) => acc + item.count, 0) || 0;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      {data?.map((item, index) => {
        const percent = total ? (item.count / total) * 100 : 0;
        const [from, to] = COLORS[index % COLORS.length];

        return (
          <div key={index} className="flex flex-col gap-1">
            {/* Header */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">
                {item.count} • {Math.round(percent)}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percent}%`,
                  background: `linear-gradient(135deg, ${from}, ${to})`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useStats();

  const COLORS = ["#4099ff", "#2ed8b6", "#FFB64D", "#8e44ad"];

  return (
    <div className="space-y-8">
      <TitleSEO
        title="Дашборд"
        description="Главная панель управления с ключевыми метриками и KPI."
        canonical="/dashboard"
      />

      {/* KPI-карточки — 4 в ряд */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Всего клиентов"
          value={data?.clientsTotal}
          icon={Users}
          isLoading={isLoading}
          bg={cardGradients.clients}
        />
        <StatCard
          title="Лидов в работе"
          bg={cardGradients.leadsWork}
          value={data?.leadsInProgress}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          title="Закрыто за месяц"
          bg={cardGradients.leadsClose}
          value={data?.leadsClosedThisMonth}
          icon={CheckCircle}
          isLoading={isLoading}
        />
        <StatCard
          title="Задач к выполнению"
          bg={cardGradients.tasks}
          value={data?.tasksTodo}
          icon={ClipboardList}
          isLoading={isLoading}
        />
      </div>

      {/* График + последние лиды — рядом */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Лиды по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <LeadsProgress data={data?.leadsByStatus} />
            )}
          </CardContent>
        </Card>

        {/* Последние 5 лидов */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Последние лиды</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.recentLeads?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет лидов</p>
            ) : (
              <ul className="space-y-3">
                {data?.recentLeads?.map((lead) => (
                  <li
                    key={lead.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium">{lead.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {lead.client.name}
                      </p>
                    </div>
                    <Badge variant={LEAD_STATUS_VARIANT[lead.status]}>
                      {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
