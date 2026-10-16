import { apiClient } from "@shared/api/client";
import type { CouponRegisterResponse } from "../model/types";

/**
 * 쿠폰 등록 (legacy `mypage_coupon_proc.php`). `POST /api/mypage/coupon`.
 * 백엔드: 쿠폰 검증·포인트 지급. 응답 `{ result }` (result="성공"=지급).
 */
export async function postCouponRegister(couponNumber: string): Promise<CouponRegisterResponse> {
  return apiClient.post<CouponRegisterResponse>("mypage/coupon", { coupon_number: couponNumber });
}
