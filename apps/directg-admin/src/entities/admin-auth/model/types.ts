// legacy AdminMember::adminLogin 응답 envelope을 그대로 유지한다 (docs/migration/admin/auth/login.md)
export type AdminLoginErrorCode = "OK" | "NO_AUTH_CONFIRM" | "NOT_FOUND";

export type AdminLoginRequest = {
  admin_id: string;
  admin_pwd: string;
};

export type AdminSessionData = {
  admin_id: string;
  admin_name: string;
  // 문자열 비교가 legacy 동작 ("1" 상품뷰어 / "99" 슈퍼 / 그 외 일반)
  admin_level: string;
  accessToken: string;
};

export type AdminLoginResponse = {
  error_code: AdminLoginErrorCode;
  error_msg: string;
  data?: AdminSessionData;
};

// legacy logout.php(session_destroy) 등가. 항상 성공(멱등) — docs/migration/admin/auth/session-guard-logout.md
export type AdminLogoutResponse = {
  error_code: "OK";
  error_msg: string;
};
