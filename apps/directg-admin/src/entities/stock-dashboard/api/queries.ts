import { useQuery } from "@tanstack/react-query";
import { fetchStockDashboard } from "./fetcher";

export const useStockDashboard = () =>
  useQuery({
    queryKey: ["admin", "goods", "stock", "dashboard"] as const,
    queryFn: fetchStockDashboard,
  });
