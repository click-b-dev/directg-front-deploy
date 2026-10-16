import { apiClient } from "@shared/api/client";
import type { NoticeListResponse } from "../model/types";

/**
 * 공지사항 목록 조회 (public, 페이지네이션 + 제목 검색).
 * `GET /api/board/notices?page=N&searchValue=S` — legacy `Board::getNoticeList` (20건/page).
 */
export async function getBoardNotices(
  page: number,
  searchValue?: string,
): Promise<NoticeListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchValue) {
    params.set("searchValue", searchValue);
  }
  return apiClient.get<NoticeListResponse>(`board/notices?${params.toString()}`);
}
