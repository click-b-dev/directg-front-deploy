import { useQuery } from "@tanstack/react-query";
import { fetchMemberDashboard } from "./fetcher";

// legacy dashboard_crm.php — refresh=false(캐시) / true(?refresh=1 강제 재집계).
export const useMemberDashboard = (refresh: boolean) =>
  useQuery({
    queryKey: ["admin", "member", "dashboard", refresh] as const,
    queryFn: () => fetchMemberDashboard(refresh),
  });
