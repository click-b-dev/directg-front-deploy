import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { PromotionWeekendConfig } from "../model/types";

/**
 * 주말특가 프로모션 설정 조회 (server-only, 세션 쿠키 전달). `GET /api/promotion/weekend/config` —
 * legacy `Promotion::getPromotionWeekend`. 기간/배너 + 접근제한 판정(isActive/allowView, 서버시간·IP는 백엔드).
 */
export async function getPromotionWeekendConfig(): Promise<PromotionWeekendConfig> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<PromotionWeekendConfig>("promotion/weekend/config", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
