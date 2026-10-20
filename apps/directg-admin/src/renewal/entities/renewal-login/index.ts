import { apiClient } from "@shared/api/client";

// 리뉴얼 로그인 API. 리뉴얼용 실서버 API가 정해지기 전까지 기존 mock 계약(legacy AdminMember::adminLogin
// envelope, `POST /admin/auth/login`)을 쓴다. 나중에 이 파일의 요청·응답 형태만 실서버에 맞춰 바꾸면 된다.
// (기존 legacy 로그인 화면(/login)은 실서버 `POST /v0/admin/login`을 그대로 쓴다.)
export type RenewalLoginRequest = {
  admin_id: string;
  admin_pwd: string;
};

export type RenewalLoginResponse = {
  error_code: "OK" | "NO_AUTH_CONFIRM" | "NOT_FOUND";
  error_msg: string;
  data?: {
    admin_id: string;
    admin_name: string;
    // "1" 상품뷰어 / "99" 슈퍼 / 그 외 일반 (문자열 비교)
    admin_level: string;
    accessToken: string;
  };
};

export const renewalLogin = (payload: RenewalLoginRequest) =>
  apiClient.post<RenewalLoginResponse>("/admin/auth/login", payload);
