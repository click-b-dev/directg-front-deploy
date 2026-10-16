import { apiClient } from "@shared/api/client";
import type { RequestReturnRequest, RequestReturnResponse } from "../model/cancel-types";

/**
 * 취소요청 철회 (client). `POST /api/mypage/orders/request-return` — legacy `mypage_proc.php` mode=requestReturn.
 * 백엔드: status 8 → 2 복원(m_no=세션), 성공 시 "주문취소철회" 로그.
 */
export async function postRequestReturn(
  payload: RequestReturnRequest,
): Promise<RequestReturnResponse> {
  return apiClient.post<RequestReturnResponse>("mypage/orders/request-return", payload);
}
