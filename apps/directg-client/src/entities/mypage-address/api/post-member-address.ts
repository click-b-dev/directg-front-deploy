import { apiClient } from "@shared/api/client";
import type { AddressSaveResponse, MemberAddress } from "../model/types";

/**
 * 배송지 저장 (client). `POST /api/mypage/address` — legacy `mode=setaddress`
 * (tbl_member_address upsert). 세션 만료 시 error_code=NG.
 */
export async function postMemberAddress(payload: MemberAddress): Promise<AddressSaveResponse> {
  return apiClient.post<AddressSaveResponse>("mypage/address", payload);
}
