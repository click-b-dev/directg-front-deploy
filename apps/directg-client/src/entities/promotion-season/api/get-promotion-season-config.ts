import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { PromotionSeasonConfig } from "../model/types";

/**
 * 시즌 프로모션 설정 조회 (server-only, 세션 쿠키 전달). `GET /api/promotion/season/config` —
 * legacy `Promotion::getPromotionSeason`. 기간/배너/notice + 접근제한 판정(isActive/allowView, 서버시간·IP는 백엔드).
 */
export async function getPromotionSeasonConfig(): Promise<PromotionSeasonConfig> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<PromotionSeasonConfig>("promotion/season/config", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
