import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGracList, fetchGracEntnameList, syncGracBatch, createGrac } from "./fetcher";
import type { GracListSearch, GracBatchRequest, GracRegisterRequest } from "../model/types";

const GRAC_KEY = ["admin", "goods", "grac"] as const;

export const gracListQueryKey = (query: GracListSearch) => [...GRAC_KEY, query] as const;

// legacy grac/grac_list.php — 심의정보 현황.
export const useGracList = (query: GracListSearch) =>
  useQuery({
    queryKey: gracListQueryKey(query),
    queryFn: () => fetchGracList(query),
  });

export const gracEntnameListQueryKey = () => [...GRAC_KEY, "entname"] as const;

// legacy grac/grac_batch.php — 심의정보 동기화 대상 목록.
export const useGracEntnameList = () =>
  useQuery({
    queryKey: gracEntnameListQueryKey(),
    queryFn: () => fetchGracEntnameList(),
  });

// legacy grac_ps.php mode=grac_batch → location.reload() = GRAC invalidate.
export const useSyncGracBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: GracBatchRequest) => syncGracBatch(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GRAC_KEY }),
  });
};

// legacy grac_register.php mode=register → grac_list 리다이렉트 = GRAC invalidate.
export const useCreateGrac = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: GracRegisterRequest) => createGrac(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GRAC_KEY }),
  });
};
