import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getImportJobById,
  getImportJobs,
  getQueueMetrics,
  getSystemStatus,
  startDemoImportJob,
} from "../api/import-jobs";

export function useSystemStatus() {
  return useQuery({
    queryKey: ["imports-system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 5000,
  });
}

export function useQueueMetrics() {
  return useQuery({
    queryKey: ["imports-queue-metrics"],
    queryFn: getQueueMetrics,
    refetchInterval: 3000,
  });
}

export function useImportJobs() {
  return useQuery({
    queryKey: ["imports-jobs"],
    queryFn: getImportJobs,
    refetchInterval: 3000,
  });
}

export function useImportJobById(jobId?: string | null) {
  return useQuery({
    queryKey: ["imports-job-by-id", jobId],
    queryFn: () => getImportJobById(jobId!),
    enabled: !!jobId,
    refetchInterval: 1500,
  });
}

export function useStartDemoImport() {
  return useMutation({
    mutationFn: startDemoImportJob,
  });
}
