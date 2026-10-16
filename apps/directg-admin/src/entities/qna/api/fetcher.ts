import { apiClient } from "@shared/api/client";
import type {
  QnaListSearch,
  QnaListResponse,
  QnaDeleteRequest,
  QnaDeleteResult,
  QnaDetail,
  QnaMailRequest,
  QnaMailResult,
  QnaAnswerRequest,
  QnaAnswerResult,
} from "../model/types";

// legacy board/qna_list.php — 문의하기 목록(idx DESC, 30/page).
export const fetchQnaList = (query: QnaListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof QnaListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("searchType", query.searchType);
  set("searchTitle", query.searchTitle);
  set("searchGubun", query.searchGubun);
  set("is_answer", query.is_answer);
  set("replyStatus", query.replyStatus);
  set("email_flag", query.email_flag);
  return apiClient.get<QnaListResponse>("/admin/board/qnas", { searchParams });
};

// legacy qna_ps.php mode=delete — 다중 삭제.
export const deleteQnas = (payload: QnaDeleteRequest) =>
  apiClient.post<QnaDeleteResult>("/admin/board/qnas/delete", payload);

// legacy qna_view.php — 문의 상세(회원·첨부·이력 포함).
export const fetchQnaDetail = (idx: number) => apiClient.get<QnaDetail>(`/admin/board/qnas/${idx}`);

// legacy qna_ps.php mode=mail — 문의답변 메일 발송.
export const sendQnaMail = (idx: number, payload: QnaMailRequest) =>
  apiClient.post<QnaMailResult>(`/admin/board/qnas/${idx}/mail`, payload);

// legacy qna_ps.php mode=update — 답변 저장.
export const submitQnaAnswer = (idx: number, payload: QnaAnswerRequest) =>
  apiClient.post<QnaAnswerResult>(`/admin/board/qnas/${idx}/answer`, payload);
