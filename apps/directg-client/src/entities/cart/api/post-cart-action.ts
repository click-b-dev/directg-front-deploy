import { apiClient } from "@shared/api/client";
import type { CartActionRequest, CartActionResponse } from "../model/types";

/**
 * 장바구니 액션 (client). `POST /api/order/cart` — legacy `cart_proc.php`.
 * select/deselect는 선택상태 영속화(응답 무시), del_cart/select_del_cart는 삭제 후 목록 갱신.
 */
export async function postCartAction(payload: CartActionRequest): Promise<CartActionResponse> {
  return apiClient.post<CartActionResponse>("order/cart", payload);
}
