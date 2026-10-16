import { apiClient } from "@shared/api/client";
import type { TimedealResponse } from "../model/types";

/**
 * 모바일 타임딜 조회 (`GET /api/promotion/timedeal`) — legacy `mobile/promotion/timedeal.html`.
 * 백엔드: tbl_event(timedeal='Y' start_dt DESC LIMIT 1) + tbl_event_goods ⋈ tbl_goods,
 * order_ea = max(order_ea, 기간 내 tbl_order_item count). 이벤트 없으면 active=false.
 * 공개(세션 불필요).
 */
export async function getTimedeal(): Promise<TimedealResponse> {
  return apiClient.get<TimedealResponse>("promotion/timedeal");
}
