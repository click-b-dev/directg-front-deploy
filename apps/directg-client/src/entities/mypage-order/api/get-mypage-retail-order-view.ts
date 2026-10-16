import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageRetailOrderViewResponse } from "../model/retail-order-view-types";

/**
 * 실물주문 상세 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/retail-orders/view?settle_no=X` — legacy
 * `Mypage::getRetailOrder` + PG 로그(별도 DGKR DB). ⚠️ 백엔드는 m_no=1023882 하드코딩 필터(legacy verbatim).
 */
export async function getMypageRetailOrderView(
  settleNo: string,
): Promise<MypageRetailOrderViewResponse> {
  const params = new URLSearchParams({ settle_no: settleNo });
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageRetailOrderViewResponse>(
    `mypage/retail-orders/view?${params.toString()}`,
    { headers: cookieHeader ? { cookie: cookieHeader } : undefined },
  );
}
