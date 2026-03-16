import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/get-stats";

export function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getStats,
    // Обновляем каждые 5 минут — статистика не должна быть супер-свежей
    staleTime: 1000 * 60 * 5,
  });
}
