import { apiClient } from "@shared/api/client";
import type { MemberOtpStatusResponse } from "../model/types";

/**
 * 비밀번호 재설정 진입 가드용 OTP 상태 조회. `GET /api/member/otp-status?m_id=` — legacy `Mypage::getOtp` 축소.
 * 백엔드: `tbl_otp` 조회 후 인증 상태(auth)만 반환. otp/token 원문은 노출하지 않는다.
 */
export async function getMemberOtpStatus(mId: string): Promise<MemberOtpStatusResponse> {
  return apiClient.get<MemberOtpStatusResponse>(
    `member/otp-status?m_id=${encodeURIComponent(mId)}`,
  );
}
