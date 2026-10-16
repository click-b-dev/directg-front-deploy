import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { GamePackageDetailResponse } from "../model/types";

/**
 * 패키지 옵션 상세 조회 (server-only, 세션 쿠키 전달).
 * `GET /api/game/package-detail?sku=X` — legacy `mobile/game/game_package_view.html`
 * (getGoodsItemDetailSku + getTitleDetail + description + package info 조립). product_id는 legacy 미사용.
 */
export async function getGamePackageDetail(sku: string): Promise<GamePackageDetailResponse> {
  const params = new URLSearchParams({ sku });
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GamePackageDetailResponse>(`game/package-detail?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
