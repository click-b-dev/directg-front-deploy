import { apiClient } from "@shared/api/client";
import type { OrderMutationResponse } from "../model/order-view-types";

/**
 * 제품키 활성화(수취확인) (client). `POST /api/mypage/orders/activate` — legacy `licence_activate.php` setXxxActivate.
 * order_system으로 백엔드 분기. error_code=="99"면 실패(alert), 그 외 성공(reload).
 */
export async function postOrderActivate(payload: {
  settle_no: string;
  ordno: string;
  order_system: string;
}): Promise<OrderMutationResponse> {
  return apiClient.post<OrderMutationResponse>("mypage/orders/activate", payload);
}
