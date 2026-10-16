import { apiClient } from "@shared/api/client";
import type { DataroomListResponse } from "../model/types";

/**
 * 자료실 목록 조회 (public). `GET /api/board/dataroom?page=N` — legacy `Dataroom::getDataroomList`
 * (is_free='Y' and is_view='Y', reg_date DESC). UI는 페이지네이션 없이 page1 목록만 사용.
 */
export async function getBoardDataroom(page = 1): Promise<DataroomListResponse> {
  return apiClient.get<DataroomListResponse>(`board/dataroom?page=${page}`);
}
