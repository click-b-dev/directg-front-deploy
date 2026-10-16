import { apiClient } from "@shared/api/client";
import type { MemberOtpVerifyRequest, MemberOtpVerifyResponse } from "../model/types";

/**
 * 비밀번호 찾기 인증번호(OTP) 검증. `POST /api/member/otp/verify` — legacy 모바일 `user_certification_proc.php mode=authConfirm`.
 * 백엔드: `tbl_member_otp` token·otp 대조, 성공 시 인증완료 마킹. 응답 `{code, message}`(code "ok"=성공).
 */
export async function postMemberOtpVerify(
  payload: MemberOtpVerifyRequest,
): Promise<MemberOtpVerifyResponse> {
  return apiClient.post<MemberOtpVerifyResponse>("member/otp/verify", payload);
}
