import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { WeekendGamesResponse } from "@entities/promotion-weekend";

/**
 * 시즌 프로모션 게임 목록 조회 (server-only, 세션 쿠키 — wishlist_chk). `GET /api/promotion/season/games` —
 * legacy `Promotion::getPromotionSeasonGame2`(시즌 기간 프로모션, game+basic, release desc, 30개). ProductThumb 재사용.
 */
export async function getPromotionSeasonGames(): Promise<WeekendGamesResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<WeekendGamesResponse>("promotion/season/games", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
