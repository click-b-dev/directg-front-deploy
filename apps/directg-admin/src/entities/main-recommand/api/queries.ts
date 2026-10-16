import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMainRecommand,
  deleteMainRecommand,
  fetchMainRecommand,
  fetchMainRecommandList,
  sortMainRecommand,
  updateMainRecommand,
} from "./fetcher";
import type {
  MainRecommandListQuery,
  RecommandSortDirection,
  UpdateMainRecommandRequest,
} from "../model/types";

const MAIN_RECOMMAND_KEY = ["admin", "site", "main-recommands"] as const;

export const mainRecommandListQueryKey = (query: MainRecommandListQuery) =>
  [...MAIN_RECOMMAND_KEY, query] as const;

export const useMainRecommandList = (query: MainRecommandListQuery) =>
  useQuery({
    queryKey: mainRecommandListQueryKey(query),
    queryFn: () => fetchMainRecommandList(query),
  });

export const useMainRecommand = (idx: number) =>
  useQuery({
    queryKey: [...MAIN_RECOMMAND_KEY, "detail", idx] as const,
    queryFn: () => fetchMainRecommand(idx),
  });

// legacy: mutation 성공 후 location.reload → 목록 재조회. invalidate로 동일 효과.
export const useSortMainRecommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, direction }: { idx: number; direction: RecommandSortDirection }) =>
      sortMainRecommand(idx, direction),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_RECOMMAND_KEY }),
  });
};

export const useDeleteMainRecommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idx: number) => deleteMainRecommand(idx),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_RECOMMAND_KEY }),
  });
};

// legacy: register 성공 → main_recommand.php 리다이렉트. 목록 invalidate 후 소비 측에서 이동.
export const useCreateMainRecommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMainRecommand,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_RECOMMAND_KEY }),
  });
};

// legacy: modify 성공 → main_recommand.php 리다이렉트.
export const useUpdateMainRecommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: UpdateMainRecommandRequest }) =>
      updateMainRecommand(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MAIN_RECOMMAND_KEY }),
  });
};
