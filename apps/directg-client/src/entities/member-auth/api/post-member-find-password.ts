import { apiClient } from "@shared/api/client";
import type { MemberFindPasswordRequest, MemberFindPasswordResponse } from "../model/types";

/**
 * 비밀번호 찾기 가입여부확인. `POST /api/member/find-password` — legacy join_proc `mode=findpassword`.
 * 백엔드: 회원 확인, OTP token/code 생성·저장, 인증번호 메일 발송. 응답은 legacy JSON 형식 유지.
 */
export async function postMemberFindPassword(
  payload: MemberFindPasswordRequest,
): Promise<MemberFindPasswordResponse> {
  return apiClient.post<MemberFindPasswordResponse>("member/find-password", payload);
}
