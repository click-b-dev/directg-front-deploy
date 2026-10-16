import { apiClient } from "@shared/api/client";
import type { EventListResponse } from "../model/types";

/**
 * 진행중 프로모션 이벤트 목록 조회 (public). `GET /api/promotion/events` — legacy
 * `Promotion::getPromotionEventList(show_promotion='Y')`. getEvenBoardtList와 동일 필드 + show_promotion 필터.
 * 필터·정렬·Parsedown 렌더는 백엔드. EventItem 재사용.
 */
export async function getPromotionEvents(): Promise<EventListResponse> {
  return apiClient.get<EventListResponse>("promotion/events");
}
