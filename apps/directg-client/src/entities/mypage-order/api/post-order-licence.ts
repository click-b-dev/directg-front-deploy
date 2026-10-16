import { apiClient } from "@shared/api/client";
import type { OrderLicenceResponse } from "../model/order-view-types";

/**
 * 제품키 확인 (client). `POST /api/mypage/orders/licence` — legacy `licence_activate.php` getXxxLicence.
 * order_system(Asset/Ztorm/Genba/Vaultn/PointNexus)로 백엔드가 분기. 응답 `{html}`(제품키 HTML, 모달 표시).
 */
export async function postOrderLicence(payload: {
  settle_no: string;
  ordno: string;
  order_system: string;
}): Promise<OrderLicenceResponse> {
  return apiClient.post<OrderLicenceResponse>("mypage/orders/licence", payload);
}
