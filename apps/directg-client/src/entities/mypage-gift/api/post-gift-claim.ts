import { apiClient } from "@shared/api/client";
import type { GiftClaimRequest, GiftClaimResponse } from "../model/types";

/**
 * 사은품 신청 (client). `POST /api/mypage/gift/claim` — legacy `mypage_gift_proc.php`.
 * 배송(is_delivery=Y)이면 주소 저장/발송신청, 키(그 외)면 키예약·캐시지급(백엔드). 응답 `{msg}`.
 */
export async function postGiftClaim(payload: GiftClaimRequest): Promise<GiftClaimResponse> {
  return apiClient.post<GiftClaimResponse>("mypage/gift/claim", payload);
}
