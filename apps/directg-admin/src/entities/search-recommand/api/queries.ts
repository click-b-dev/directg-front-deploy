import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignSearchRecommandSlot,
  clearSearchRecommandSlot,
  deleteSearchRecommand,
  fetchSearchRecommands,
  modifySearchRecommand,
  registerSearchRecommandSlot,
} from "./fetcher";
import type {
  SearchRecommandListQuery,
  SearchRecommandModifyRequest,
  SlotAssignRequest,
  SlotRegisterRequest,
} from "../model/types";

const SEARCH_RECOMMAND_KEY = ["admin", "site", "search-recommands"] as const;

export const searchRecommandQueryKey = (query: SearchRecommandListQuery) =>
  [...SEARCH_RECOMMAND_KEY, query] as const;

export const useSearchRecommands = (query: SearchRecommandListQuery) =>
  useQuery({
    queryKey: searchRecommandQueryKey(query),
    queryFn: () => fetchSearchRecommands(query),
  });

// legacy: mutation 성공 후 location.reload → 재조회. invalidate로 동일 효과.
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SEARCH_RECOMMAND_KEY });
};

export const useRegisterSearchRecommandSlot = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: SlotRegisterRequest) => registerSearchRecommandSlot(payload),
    onSuccess: invalidate,
  });
};

export const useModifySearchRecommand = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: SearchRecommandModifyRequest }) =>
      modifySearchRecommand(idx, payload),
    onSuccess: invalidate,
  });
};

export const useAssignSearchRecommandSlot = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: SlotAssignRequest }) =>
      assignSearchRecommandSlot(idx, payload),
    onSuccess: invalidate,
  });
};

export const useClearSearchRecommandSlot = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (idx: number) => clearSearchRecommandSlot(idx),
    onSuccess: invalidate,
  });
};

export const useDeleteSearchRecommand = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (idx: number) => deleteSearchRecommand(idx),
    onSuccess: invalidate,
  });
};
