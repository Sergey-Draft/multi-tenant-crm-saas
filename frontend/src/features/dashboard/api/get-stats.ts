import { api } from "@/lib/api-client";

export type LeadsByStatus = {
  status: string;
  label: string;
  count: number;
};

export type RecentLead = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  client: { name: string };
};

export type DashboardStats = {
  clientsTotal: number;
  leadsInProgress: number;
  leadsClosedThisMonth: number;
  tasksTodo: number;
  leadsByStatus: LeadsByStatus[];
  recentLeads: RecentLead[];
};

export async function getStats(): Promise<DashboardStats> {
  const res = await api.get("/dashboard/stats");
  return res.data;
}
