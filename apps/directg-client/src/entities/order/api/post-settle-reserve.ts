import { apiClient } from "@shared/api/client";
import type { KcpReserveResponse } from "../model/types";

/** checkoutFrm 직렬화 필드(파일럿에서 사용하는 값). 백엔드는 세션+본 필드로 예약 수행. */
export type CheckoutPayload = Record<string, string>;

/**
 * KCP 예약 (client). `POST /api/order/kcp/reserve` — legacy `kcp_reserve.php`.
 * code 분기(0 일반 / 1 가상계좌 / NG 미로그인 / NG_POINT 포인트초과).
 */
export async function postKcpReserve(payload: CheckoutPayload): Promise<KcpReserveResponse> {
  return apiClient.post<KcpReserveResponse>("order/kcp/reserve", payload);
}

/**
 * 0원 전액할인 주문확정 (client). `POST /api/order/full-discount` — legacy `order_full_discount.php`.
 * 성공 시 이동할 URL(order_end) 문자열 반환.
 */
export async function postFullDiscount(payload: CheckoutPayload): Promise<string> {
  const { url } = await apiClient.post<{ url: string }>("order/full-discount", payload);
  return url;
}
