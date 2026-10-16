import { NextResponse, type NextRequest } from "next/server";

/**
 * 로그아웃 (legacy `pc/member/logout` — session_destroy + `/index.php` redirect).
 * dev: same-origin `dg_member` 쿠키 삭제 후 홈으로 이동. 프로덕션은 백엔드 `POST /api/member/logout`이
 * httpOnly 세션 쿠키를 파기하는 계약(라우트가 이를 호출·전파).
 */
export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("dg_member", "", { path: "/", maxAge: 0 });
  return response;
}
