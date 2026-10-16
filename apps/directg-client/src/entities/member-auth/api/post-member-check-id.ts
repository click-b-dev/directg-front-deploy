import { apiClient } from "@shared/api/client";
import type { MemberCheckIdResponse } from "../model/types";

/**
 * 아이디(이메일) 중복확인. `POST /api/member/check-id` — legacy join_proc `mode=idChk`.
 * 차단 도메인/기존 회원 → error_code "1", 가능 → "0".
 */
export async function postMemberCheckId(m_id: string): Promise<MemberCheckIdResponse> {
  return apiClient.post<MemberCheckIdResponse>("member/check-id", { m_id });
}
