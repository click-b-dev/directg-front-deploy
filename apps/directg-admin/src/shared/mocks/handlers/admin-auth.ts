import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

// MSW handler는 클라이언트가 실제로 emit 하는 URL과 일치해야 한다.
// api-client(ky v2)는 env.apiBaseUrl(prefix)을 input에 prepend → 실제 요청은 `${apiBaseUrl}/<path>`.
// 따라서 handler도 동일 base를 붙인다(단일 소스: env 재사용).
const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type AdminLogoutResponse = {
  error_code: "OK";
  error_msg: string;
};

// tbl_admin 시드는 mock DB(db.admin)로 이관 — shared/mocks/db/tables/admin.ts 참조.

export const adminAuthHandlers = [
  // 로그인(POST /v0/admin/login)은 실서버 연동 완료 — mock 없음(onUnhandledRequest: bypass로 실서버 호출).

  // legacy logout.php: session_destroy 등가. 토큰 무효화는 백엔드 책임, 항상 OK(멱등).
  // docs/migration/admin/auth/session-guard-logout.md 계약 기준
  http.post(api("/admin/auth/logout"), () => {
    return HttpResponse.json<AdminLogoutResponse>({
      error_msg: "성공",
      error_code: "OK",
    });
  }),
];
