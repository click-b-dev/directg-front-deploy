import { apiClient } from "@shared/api/client";
import type { PreorderListResponse } from "../model/types";

/**
 * 예약구매 목록 조회 (server-only).
 * `GET /api/game/preorder?page=N` — legacy `Goods::getGoodsOptionPreOrderM`(release_date>오늘, orderby release_date asc)
 * + 타이틀별 옵션 병합(getTitleGameList/EditionList/DLCList) + getPromotionGoodsPrice. 60 단위는 백엔드.
 */
export async function getPreorderList(page: number): Promise<PreorderListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  return apiClient.get<PreorderListResponse>(`game/preorder?${params.toString()}`);
}
