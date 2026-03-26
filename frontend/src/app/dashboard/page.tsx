"use client";

import { useStats } from "@/features/dashboard/hooks/use-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, TrendingUp, CheckCircle, ClipboardList } from "lucide-react";
import { TitleSEO } from "@/components/titleSEO/title-SEO";

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

// KPI-карточка: иконка + число + подпись
function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number | undefined;
  icon: React.ElementType;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-3xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useStats();

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
        />
        <StatCard
          title="Лидов в работе"
          value={data?.leadsInProgress}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <StatCard
          title="Закрыто за месяц"
          value={data?.leadsClosedThisMonth}
          icon={CheckCircle}
          isLoading={isLoading}
        />
        <StatCard
          title="Задач к выполнению"
          value={data?.tasksTodo}
          icon={ClipboardList}
          isLoading={isLoading}
        />
      </div>

      {/* График + последние лиды — рядом */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Лиды по статусам — Bar chart */}
        {/* ResponsiveContainer растягивает chart на всю ширину родителя */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Лиды по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data?.leadsByStatus}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  {/* XAxis — ось X, dataKey указывает какое поле брать из data */}
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  {/* Bar — сами столбики, dataKey="count" берёт число из объекта */}
                  <Bar
                    dataKey="count"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    name="Лидов"
                  />
                </BarChart>
              </ResponsiveContainer>
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
