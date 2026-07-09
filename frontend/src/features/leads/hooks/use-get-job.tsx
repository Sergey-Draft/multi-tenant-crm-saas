import { useQuery } from "@tanstack/react-query";
import { getJob } from "../api/get-job";

export function useImportJob(jobId?: string) {
  return useQuery({
    queryKey: ["import-job", jobId],
    queryFn: () => getJob(jobId!),
    enabled: !!jobId,

    refetchInterval: (query: any) => {
      const data = query?.state?.data;
      if (!data) return 2000;

      if (data.state === "completed" || data.state === "failed") {
        return false;
      }

      return 2000;
    },
  });
}
