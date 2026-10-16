import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchFaqList, fetchFaqDetail, updateFaq } from "./fetcher";
import type { FaqListSearch, FaqSaveRequest } from "../model/types";

const FAQ_KEY = ["admin", "board", "faq"] as const;

export const faqListQueryKey = (query: FaqListSearch) => [...FAQ_KEY, query] as const;

// legacy board/faq_list.php — 자주묻는질문 목록.
export const useFaqList = (query: FaqListSearch) =>
  useQuery({
    queryKey: faqListQueryKey(query),
    queryFn: () => fetchFaqList(query),
  });

export const faqDetailQueryKey = (idx: number) => [...FAQ_KEY, "detail", idx] as const;

// legacy faq_register.php(modify 로드) — 상세.
export const useFaqDetail = (idx: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: faqDetailQueryKey(idx),
    queryFn: () => fetchFaqDetail(idx),
    enabled: options?.enabled ?? true,
  });

// legacy faq_ps.php mode=modify → faq_list 리다이렉트 = 목록 invalidate.
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: FaqSaveRequest }) =>
      updateFaq(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FAQ_KEY }),
  });
};
