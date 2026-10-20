import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import { db } from "../db";

// MSW handler는 클라이언트가 실제로 emit 하는 URL과 일치해야 한다.
// api-client(ky v2)는 env.apiBaseUrl(prefix)을 input에 prepend → 실제 요청은 `${apiBaseUrl}/<path>`.
// 따라서 handler도 동일 base를 붙인다(단일 소스: env 재사용).
const api = (path: string) => `${env.apiBaseUrl}${path}`;

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type AdminLogoutResponse = {
  error_code: "OK";
  error_msg: string;
};

// 계약 스키마 사본 (shared는 entities를 import할 수 없다 — FSD import 방향)
type AdminLoginRequest = { admin_id: string; admin_pwd: string };
type AdminLoginResponse = {
  error_code: "OK" | "NO_AUTH_CONFIRM" | "NOT_FOUND";
  error_msg: string;
  data?: { admin_id: string; admin_name: string; admin_level: string; accessToken: string };
};

// tbl_admin 시드는 mock DB(db.admin)로 이관 — shared/mocks/db/tables/admin.ts 참조.

export const adminAuthHandlers = [
  // 리뉴얼 로그인용 mock(POST /admin/auth/login). 기존 legacy 로그인 화면(/login)은 실서버
  // `POST /v0/admin/login`을 쓰므로 mock이 없다(onUnhandledRequest: bypass로 실서버 호출).
  // 리뉴얼용 실서버 API가 정해지면 이 mock과 renewal/entities/renewal-login을 함께 교체한다.
  http.post(api("/admin/auth/login"), async ({ request }) => {
    const { admin_id, admin_pwd } = (await request.json()) as AdminLoginRequest;
    const row = db.admin.find((a) => a.admin_id === admin_id && a.admin_pwd === admin_pwd);

    // legacy 분기 순서 재현: 행이 없으면(미존재/오답) status 검사가 먼저 걸려 NO_AUTH_CONFIRM
    if (!row || row.status !== "y") {
      return HttpResponse.json<AdminLoginResponse>({
        error_msg: " 미승인된 회원입니다.",
        error_code: "NO_AUTH_CONFIRM",
      });
    }

    return HttpResponse.json<AdminLoginResponse>({
      error_msg: "성공",
      error_code: "OK",
      data: {
        admin_id: row.admin_id,
        admin_name: row.admin_name,
        admin_level: row.admin_level,
        accessToken: "mock-admin-access-token",
      },
    });
  }),

  // legacy logout.php: session_destroy 등가. 토큰 무효화는 백엔드 책임, 항상 OK(멱등).
  // docs/migration/admin/auth/session-guard-logout.md 계약 기준
  http.post(api("/admin/auth/logout"), () => {
    return HttpResponse.json<AdminLogoutResponse>({
      error_msg: "성공",
      error_code: "OK",
    });
  }),
];
