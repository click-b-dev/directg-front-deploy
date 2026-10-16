import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { WeekendGamesResponse } from "../model/games-types";

/**
 * 주말특가 프로모션 게임 목록 조회 (server-only, 세션 쿠키 전달 — wishlist_chk용). `GET /api/promotion/weekend/games` —
 * legacy `Promotion::getPromotionIng`(주말특가 기간 프로모션, game+basic, release desc, 30개). ProductThumb 재사용.
 */
export async function getPromotionWeekendGames(): Promise<WeekendGamesResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<WeekendGamesResponse>("promotion/weekend/games", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
