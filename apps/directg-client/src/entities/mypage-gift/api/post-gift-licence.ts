import { apiClient } from "@shared/api/client";
import type { GiftLicenceResponse } from "../model/types";

/**
 * 제품키 조회 (client). `POST /api/mypage/gift/licence` — legacy `licence_activate.php` getGiftView.
 * error_code="0"이면 error_msg가 제품키 HTML(모달 표시).
 */
export async function postGiftLicence(payload: {
  ordno: string;
  reserve_id: string;
}): Promise<GiftLicenceResponse> {
  return apiClient.post<GiftLicenceResponse>("mypage/gift/licence", payload);
}
