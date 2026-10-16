import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageRefundResponse } from "../model/refund-types";

/**
 * 환불(취소) 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/refunds` — legacy `Mypage::getOrderList`
 * (**별도 DGKR DB**, step 8·9·99 AND m_no=세션, id DESC, 20건/page). 기간(ord_ymd)·item_name 집계는 백엔드.
 */
export async function getMypageRefunds(
  page: number,
  searchStartDate: string,
  searchEndDate: string,
): Promise<MypageRefundResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchStartDate) {
    params.set("search_start_date", searchStartDate);
  }
  if (searchEndDate) {
    params.set("search_end_date", searchEndDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageRefundResponse>(`mypage/refunds?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
