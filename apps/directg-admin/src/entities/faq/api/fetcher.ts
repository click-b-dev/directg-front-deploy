import { apiClient } from "@shared/api/client";
import type {
  FaqListSearch,
  FaqListResponse,
  FaqDetail,
  FaqSaveRequest,
  FaqActionResult,
} from "../model/types";

// legacy board/faq_list.php — 자주묻는질문 목록(idx desc, 30/page).
export const fetchFaqList = (query: FaqListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof FaqListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_item_cd", query.search_item_cd);
  set("search_subject", query.search_subject);
  return apiClient.get<FaqListResponse>("/admin/board/faqs", { searchParams });
};

// legacy faq_register.php(modify 로드) — 상세.
export const fetchFaqDetail = (idx: number) => apiClient.get<FaqDetail>(`/admin/board/faqs/${idx}`);

// legacy faq_ps.php mode=modify — 수정.
export const updateFaq = (idx: number, payload: FaqSaveRequest) =>
  apiClient.put<FaqActionResult>(`/admin/board/faqs/${idx}`, payload);
