import { apiClient } from "@shared/api/client";
import type { FaqListResponse } from "../model/types";

/**
 * FAQ 목록 조회 (public, 페이지네이션 + 질문 검색).
 * `GET /api/board/faqs?page=N&searchValue=S` — legacy `Board::getFaqList` (faq_type asc, 20건/page).
 */
export async function getBoardFaqs(page: number, searchValue?: string): Promise<FaqListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchValue) {
    params.set("searchValue", searchValue);
  }
  return apiClient.get<FaqListResponse>(`board/faqs?${params.toString()}`);
}
