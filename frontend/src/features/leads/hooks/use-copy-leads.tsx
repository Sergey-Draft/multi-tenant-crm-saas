import { useMutation } from "@tanstack/react-query";
import { jobTypes, startImportLeadsDemo } from "../api/import-leads";

export default function useImportLeadsDemo(options?: {
  onSuccess?: (res: any) => void;
}) {
  return useMutation({
    mutationFn: (job: jobTypes) => startImportLeadsDemo (job),

    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
  });
}