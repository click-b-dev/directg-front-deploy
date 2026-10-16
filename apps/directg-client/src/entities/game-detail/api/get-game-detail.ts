import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { GameDetailResponse } from "../model/types";

/**
 * 게임 상세 조회 (server-only, 세션 쿠키 전달 — is_login/wishlist_chk용).
 * `GET /api/game/detail?product_id={title_sku}&platform={code}` —
 * legacy `pc/game/game_view.html`(Goods/Promotion/Mypage2 조립, setTitleHit 부수효과).
 * platform 빈 값이면 백엔드가 타이틀 첫 플랫폼으로 고정해 응답.
 */
export async function getGameDetail(productId: string, platform = ""): Promise<GameDetailResponse> {
  const params = new URLSearchParams({ product_id: productId });
  if (platform) {
    params.set("platform", platform);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameDetailResponse>(`game/detail?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

/**
 * 홀로모델 상세 조회 (legacy `pc/game/holomodels_view.html`).
 * 데이터 계약은 game-detail과 동일(GameDetailResponse) — 백엔드가 holomodels 옵션 리스트로 조립.
 */
export async function getHolomodelsDetail(
  productId: string,
  platform = "",
): Promise<GameDetailResponse> {
  const params = new URLSearchParams({ product_id: productId });
  if (platform) {
    params.set("platform", platform);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<GameDetailResponse>(`game/holomodels-detail?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
