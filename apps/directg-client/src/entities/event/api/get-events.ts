import { apiClient } from "@shared/api/client";
import type { EventListResponse } from "../model/types";

/**
 * 이벤트 목록 조회 (public). `GET /api/events` — legacy `Board::getEvenBoardtList`
 * (리뉴얼 DB `tbl_event`, is_view='Y' + 현재 진행중, 마감임박순). 필터·정렬·Parsedown 렌더는 백엔드.
 */
export async function getEvents(): Promise<EventListResponse> {
  return apiClient.get<EventListResponse>("events");
}
