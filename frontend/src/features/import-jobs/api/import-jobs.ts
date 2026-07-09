import { api } from "@/lib/api-client";

export interface ImportProgress {
  percent: number;
  processed: number;
  created: number;
  duplicates: number;
  errors: number;
}

export interface ImportJobRow {
  id: string;
  name: string;
  state: string;
  attemptsMade: number;
  createdAt: number;
  processedOn: number | null;
  finishedOn: number | null;
  progress: ImportProgress;
  failedReason: string | null;
}

export interface SystemStatus {
  redis: {
    online: boolean;
    latencyMs: number | null;
  };
  worker: {
    online: boolean;
    lastHeartbeatAt: number | null;
  };
}

export interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

export const getSystemStatus = async (): Promise<SystemStatus> => {
  const response = await api.get("/imports/system-status");
  return response.data.system;
};

export const getQueueMetrics = async (): Promise<QueueMetrics> => {
  const response = await api.get("/imports/queue-metrics");
  return response.data.metrics;
};

export const getImportJobs = async (): Promise<ImportJobRow[]> => {
  const response = await api.get("/imports/jobs");
  return response.data.jobs;
};

export const getImportJobById = async (id: string): Promise<ImportJobRow> => {
  const response = await api.get(`/imports/jobs/${id}`);
  return response.data.job;
};

export const startDemoImportJob = async (): Promise<{ job: { id: string } }> => {
  const response = await api.post("/imports/jobs", {
    name: "import-leads-demo",
    leadIds: [123],
  });
  return response.data;
};
