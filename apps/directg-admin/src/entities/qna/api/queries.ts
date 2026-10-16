import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchQnaList, deleteQnas, fetchQnaDetail, sendQnaMail, submitQnaAnswer } from "./fetcher";
import type {
  QnaListSearch,
  QnaDeleteRequest,
  QnaMailRequest,
  QnaAnswerRequest,
} from "../model/types";

const QNA_KEY = ["admin", "board", "qna"] as const;

export const qnaListQueryKey = (query: QnaListSearch) => [...QNA_KEY, query] as const;

// legacy board/qna_list.php — 문의하기 목록.
export const useQnaList = (query: QnaListSearch) =>
  useQuery({
    queryKey: qnaListQueryKey(query),
    queryFn: () => fetchQnaList(query),
  });

export const qnaDetailQueryKey = (idx: number) => [...QNA_KEY, "detail", idx] as const;

// legacy board/qna_view.php — 문의 상세.
export const useQnaDetail = (idx: number) =>
  useQuery({
    queryKey: qnaDetailQueryKey(idx),
    queryFn: () => fetchQnaDetail(idx),
  });

// legacy qna_ps.php mode=mail → 성공 시 reload = QNA invalidate.
export const useSendQnaMail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: QnaMailRequest }) =>
      sendQnaMail(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QNA_KEY }),
  });
};

// legacy qna_ps.php mode=update → 저장 후 상세 복귀 = QNA invalidate.
export const useSubmitQnaAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ idx, payload }: { idx: number; payload: QnaAnswerRequest }) =>
      submitQnaAnswer(idx, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QNA_KEY }),
  });
};

// legacy qna_ps.php mode=delete → reload = 목록 invalidate.
export const useDeleteQnas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: QnaDeleteRequest) => deleteQnas(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QNA_KEY }),
  });
};
