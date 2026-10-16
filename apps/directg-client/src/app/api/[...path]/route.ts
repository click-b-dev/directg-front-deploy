import type { NextRequest } from "next/server";

/**
 * BFF(Backend-For-Frontend) catch-all 프록시.
 *
 * 프론트(브라우저/SSR)는 same-origin `/api/*`(apiClient prefix)만 호출하고, 이 핸들러가
 * 실제 백엔드(`BACKEND_ORIGIN`)로 투명 프록시한다. 쿠키/헤더/메서드/바디를 그대로 전달하고
 * 응답(상태·바디·Set-Cookie 포함)을 되돌린다.
 *
 * - 개발/mock 구간: MSW가 `/api/*`를 먼저 가로채므로 이 핸들러까지 도달하지 않는다(dev mock 유지).
 * - 백엔드 연결 시: `BACKEND_ORIGIN`을 실제 API origin으로 설정하면 프록시가 동작한다.
 *
 * 백엔드 접점을 이 한 곳으로 일원화 — 프론트 코드는 백엔드 origin/스킴을 알지 못한다.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** 실제 백엔드 origin (server-only). 미설정 시 로컬 기본값. */
const BACKEND_ORIGIN = (process.env.BACKEND_ORIGIN ?? "http://localhost:8080").replace(/\/$/, "");

/** 백엔드 API prefix (apiClient가 붙이는 `/api`와 동일 경로 규약). */
const BACKEND_API_PREFIX = "/api";

/** hop-by-hop / 재계산 대상 — 백엔드로 전달하지 않는다. */
const STRIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "accept-encoding",
]);

/** 응답에서 되돌리지 않는 헤더(스트림/인코딩은 런타임이 재계산). Set-Cookie는 별도 처리. */
const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "set-cookie",
]);

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const search = request.nextUrl.search;
  const target = `${BACKEND_ORIGIN}${BACKEND_API_PREFIX}/${path.join("/")}${search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const method = request.method;
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const backendRes = await fetch(target, {
    method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  const resHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });
  // 인증 쿠키 등 다중 Set-Cookie는 개별 append로 보존한다.
  for (const cookie of backendRes.headers.getSetCookie()) {
    resHeaders.append("set-cookie", cookie);
  }

  return new Response(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

const handler = async (request: NextRequest, context: RouteContext): Promise<Response> => {
  const { path } = await context.params;
  return proxy(request, path);
};

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
};
