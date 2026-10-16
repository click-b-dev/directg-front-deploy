import { useQuery } from "@tanstack/react-query";
import { fetchGoodsDashboard } from "./fetcher";

export const useGoodsDashboard = () =>
  useQuery({
    queryKey: ["admin", "goods", "dashboard"] as const,
    queryFn: fetchGoodsDashboard,
  });
