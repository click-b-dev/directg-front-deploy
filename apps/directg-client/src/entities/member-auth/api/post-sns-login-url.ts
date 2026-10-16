import { apiClient } from "@shared/api/client";
import type { SnsLoginUrlResponse, SnsProvider } from "../model/types";

/**
 * SNS 간편로그인 OAuth 인가 URL. `POST /api/member/sns/{provider}/login-url`.
 * legacy `pc/api/{provider}/{provider}_login.php` ({mode} POST → URL). 팝업 콜백/계정연결은 후속 단위.
 */
export async function postSnsLoginUrl(provider: SnsProvider): Promise<SnsLoginUrlResponse> {
  return apiClient.post<SnsLoginUrlResponse>(`member/sns/${provider}/login-url`);
}
