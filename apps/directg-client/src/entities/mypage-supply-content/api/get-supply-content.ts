import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { SupplyContentResponse } from "../model/types";

/**
 * 제공콘텐츠 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/supply-content` — legacy
 * sp_supply_goods_chk4 + sp_supply_content_chk merge/dedup, patchEncDataMember는 백엔드 인코딩.
 */
export async function getSupplyContent(): Promise<SupplyContentResponse> {
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<SupplyContentResponse>("mypage/supply-content", {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
