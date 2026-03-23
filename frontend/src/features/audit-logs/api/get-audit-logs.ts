import { api } from "@/lib/api-client";

export type AuditEntityType = "Lead" | "Client" | "Task";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string | null;
  companyId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  entityType?: AuditEntityType;
  action?: AuditAction;
}

export async function getAuditLogs(
  params?: GetAuditLogsParams
): Promise<AuditLogsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.entityType) searchParams.set("entityType", params.entityType);
  if (params?.action) searchParams.set("action", params.action);

  const query = searchParams.toString();
  const res = await api.get<AuditLogsResponse>(
    `/audit-logs${query ? `?${query}` : ""}`
  );
  return res.data;
}
