import { apiClient } from "@shared/api/client";
import type { AccountMutationResponse, CertRegResponse } from "../model/types";

/** 메일수신 동의 변경 (account_proc mode=mailling_change). */
export async function postMaillingChange(mailling: string): Promise<AccountMutationResponse> {
  return apiClient.post<AccountMutationResponse>("mypage/account/mailling", { mailling });
}

/** 수신 메일주소 변경 (account_proc mode=email_change). */
export async function postEmailChange(email: string): Promise<AccountMutationResponse> {
  return apiClient.post<AccountMutationResponse>("mypage/account/email", { email });
}

/** 비밀번호 변경 (account_proc mode=change_password). */
export async function postPasswordChange(
  new_password: string,
  new_password_re: string,
): Promise<AccountMutationResponse> {
  return apiClient.post<AccountMutationResponse>("mypage/account/password", {
    new_password,
    new_password_re,
  });
}

/** 회원 탈퇴 (account_proc mode=leave). */
export async function postMemberLeave(): Promise<AccountMutationResponse> {
  return apiClient.post<AccountMutationResponse>("mypage/account/leave", {});
}

/** KCP 본인인증 거래등록 (legacy cert_reg.php). 실제 KCP 연동은 백엔드. */
export async function postCertReg(): Promise<CertRegResponse> {
  return apiClient.post<CertRegResponse>("mypage/cert-reg", {});
}
