import { apiClient } from "@shared/api/client";
import type { MemberJoinRequest, MemberJoinResponse } from "../model/types";

/**
 * 회원가입. `POST /api/member/join` — legacy join_proc `mode=join`.
 * 백엔드: hCaptcha 검증·geoIP/IP 차단·회원 생성(is_auth=N)·인증메일. 응답 `{error_code, msg}`.
 */
export async function postMemberJoin(payload: MemberJoinRequest): Promise<MemberJoinResponse> {
  return apiClient.post<MemberJoinResponse>("member/join", payload);
}
