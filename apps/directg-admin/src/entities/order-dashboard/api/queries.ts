import { useQuery } from "@tanstack/react-query";
import { fetchOrderDashboard } from "./fetcher";

export const useOrderDashboard = () =>
  useQuery({
    queryKey: ["admin", "order", "dashboard"] as const,
    queryFn: fetchOrderDashboard,
  });
