import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageCancelViewResponse } from "../model/cancel-view-types";

/**
 * 취소완료 상세 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/orders/cancel-view?settle_no=X` — legacy
 * `Mypage::getOrderV2`/`getOrderItemV2` + `Order::getOrderAddress`(리뉴얼 DB, m_no 소유확인). 숨김행 서브쿼리 없음.
 */
export async function getMypageCancelView(settleNo: string): Promise<MypageCancelViewResponse> {
  const params = new URLSearchParams({ settle_no: settleNo });
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageCancelViewResponse>(`mypage/orders/cancel-view?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
