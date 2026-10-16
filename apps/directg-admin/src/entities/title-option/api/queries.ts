import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOption, deleteOption, fetchTitleOptions, searchOptions } from "./fetcher";
import type { AddOptionRequest, OptionSearchQuery } from "../model/types";

const TITLE_OPTION_KEY = ["admin", "goods", "title-options"] as const;

export const titleOptionsQueryKey = (titleId: number) => [...TITLE_OPTION_KEY, titleId] as const;

// legacy title_option_register.php 로드.
export const useTitleOptions = (titleId: number) =>
  useQuery({
    queryKey: titleOptionsQueryKey(titleId),
    queryFn: () => fetchTitleOptions(titleId),
  });

// legacy 검색은 버튼 클릭 시 수동 호출(모달) — mutation처럼 사용.
export const useSearchOptions = () =>
  useMutation({
    mutationFn: ({ titleId, query }: { titleId: number; query: OptionSearchQuery }) =>
      searchOptions(titleId, query),
  });

// legacy option_{cat}_add → reload = invalidate.
export const useAddOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, payload }: { titleId: number; payload: AddOptionRequest }) =>
      addOption(titleId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TITLE_OPTION_KEY }),
  });
};

// legacy option_{cat}_delete → reload = invalidate.
export const useDeleteOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      titleId,
      category,
      productCode,
    }: {
      titleId: number;
      category: string;
      productCode: string;
    }) => deleteOption(titleId, category, productCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TITLE_OPTION_KEY }),
  });
};
