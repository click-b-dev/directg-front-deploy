import { cookies } from "next/headers";

import { apiClient } from "@shared/api/client";
import type { MypageRetailOrderResponse } from "../model/retail-order-types";

/**
 * 실물 상품 취소 내역 조회 (server-only, 세션 쿠키 전달). `GET /api/mypage/retail-refunds` — legacy
 * `Mypage::getRetailOrderList`(**별도 DGKR DB** `retail_order`, m_no=세션, **step IN 8·9·11·12·13·14**,
 * id DESC, 20건/page). 기간·step 필터는 백엔드. 응답 형태는 retail-orders와 동일(`RetailOrderItem`).
 */
export async function getMypageRetailRefunds(
  page: number,
  searchStartDate: string,
  searchEndDate: string,
): Promise<MypageRetailOrderResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (searchStartDate) {
    params.set("search_start_date", searchStartDate);
  }
  if (searchEndDate) {
    params.set("search_end_date", searchEndDate);
  }
  const cookieHeader = (await cookies()).toString();
  return apiClient.get<MypageRetailOrderResponse>(`mypage/retail-refunds?${params.toString()}`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}
