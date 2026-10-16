import { useQuery } from "@tanstack/react-query";
import { fetchGenbaAvailabilityLogList } from "./fetcher";
import type { GenbaAvailabilityLogSearch } from "../model/types";

const GENBA_AVAILABILITY_LOG_KEY = ["admin", "goods", "stock", "genba-availability"] as const;

const listQueryKey = (query: GenbaAvailabilityLogSearch) =>
  [...GENBA_AVAILABILITY_LOG_KEY, "list", query] as const;

export const useGenbaAvailabilityLogList = (query: GenbaAvailabilityLogSearch) =>
  useQuery({
    queryKey: listQueryKey(query),
    queryFn: () => fetchGenbaAvailabilityLogList(query),
  });
