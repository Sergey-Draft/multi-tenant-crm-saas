import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/get-leads";

export default function useGetLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  });
}
