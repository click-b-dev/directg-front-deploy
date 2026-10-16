import { apiClient } from "@shared/api/client";
import type { OrderCancelRequest, OrderMutationResponse } from "../model/order-view-types";

/**
 * 주문취소요청 (client). `POST /api/mypage/orders/cancel` — legacy `order_cancel_proc.php` mode=order_cancel.
 * 환불계좌(message3~5)는 payment_method SC0040/SC0030/toss_bank일 때만. error_code=="OK"면 접수(alert+reload).
 */
export async function postOrderCancel(payload: OrderCancelRequest): Promise<OrderMutationResponse> {
  return apiClient.post<OrderMutationResponse>("mypage/orders/cancel", payload);
}
