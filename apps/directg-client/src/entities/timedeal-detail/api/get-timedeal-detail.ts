import { apiClient } from "@shared/api/client";
import type { TimedealDetailResponse } from "../model/types";

/**
 * 타임딜 상세 조회 (server-only). `GET /api/game/timedeal-detail?sku={goods_sku}` —
 * legacy `pc/game/timedeal_view.html`. (위시리스트 없음 → 쿠키 전달 불필요.)
 */
export async function getTimedealDetail(sku: string): Promise<TimedealDetailResponse> {
  return apiClient.get<TimedealDetailResponse>(
    `game/timedeal-detail?sku=${encodeURIComponent(sku)}`,
  );
}
