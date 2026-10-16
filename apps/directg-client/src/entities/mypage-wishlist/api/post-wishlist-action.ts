import { apiClient } from "@shared/api/client";
import type { WishlistActionRequest, WishlistActionResponse } from "../model/types";

/**
 * 위시리스트 액션 (client). `POST /api/mypage/wishlist` — legacy `wishlist_proc.php`.
 * delete/select_delete는 삭제, cart_move는 장바구니 이동(getCart 중복확인 후 addCart+삭제, 백엔드).
 */
export async function postWishlistAction(
  payload: WishlistActionRequest,
): Promise<WishlistActionResponse> {
  return apiClient.post<WishlistActionResponse>("mypage/wishlist", payload);
}
