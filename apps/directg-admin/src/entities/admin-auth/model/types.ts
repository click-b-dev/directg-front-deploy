// swagger: POST /api/v0/admin/login (https://directg-api.clickb.co.kr/swagger-ui/index.html)
export type AdminRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN" | "PUBLISHER" | "CODE";

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginContent = {
  accessToken: string;
  loginId: string;
  name: string;
  role: AdminRole;
};

// 서버 공통 envelope. 실패(401/403)는 success=false, content=null.
export type AppResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  content: T | null;
};

export type AdminLoginResponse = AppResponse<AdminLoginContent>;

// legacy logout.php(session_destroy) 등가. 항상 성공(멱등) — docs/migration/admin/auth/session-guard-logout.md
// ⚠️ swagger에 로그아웃 엔드포인트 미등록 — 기존 mock 계약 유지.
export type AdminLogoutResponse = {
  error_code: "OK";
  error_msg: string;
};
