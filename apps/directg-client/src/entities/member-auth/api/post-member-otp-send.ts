import { apiClient } from "@shared/api/client";
import type { MemberOtpSendRequest, MemberOtpSendResponse } from "../model/types";

/**
 * 비밀번호 찾기 인증번호(OTP) 발송. `POST /api/member/otp/send` — legacy 모바일 `directsend_mail_api.php mode=authEmail`.
 * 백엔드: `tbl_member_otp` OTP 생성/갱신(expire +1h) + DirectSend 인증메일 발송. 응답 `{msg, token}`.
 */
export async function postMemberOtpSend(
  payload: MemberOtpSendRequest,
): Promise<MemberOtpSendResponse> {
  return apiClient.post<MemberOtpSendResponse>("member/otp/send", payload);
}
