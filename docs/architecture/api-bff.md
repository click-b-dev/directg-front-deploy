# API BFF (Backend-For-Frontend) 프록시

directg-client의 모든 백엔드 호출은 **BFF 계층**을 경유한다. 프론트(브라우저·SSR)는 same-origin `/api/*`만 알고, 실제 백엔드 origin은 서버에서만 안다.

## 구조

```
브라우저/SSR  ──(same-origin /api/*)──▶  Next Route Handler(BFF)  ──▶  실제 백엔드(BACKEND_ORIGIN)
   apiClient (prefix=/api)              app/api/[...path]/route.ts        /api/<path>
```

- **catch-all 프록시 1개**: `apps/directg-client/src/app/api/[...path]/route.ts` 가 모든 `/api/*`(GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS)를 투명 프록시.
- 요청: 메서드·쿼리·헤더(cookie 포함)·바디를 그대로 전달(hop-by-hop 헤더 제외).
- 응답: 백엔드 상태·바디·헤더를 되돌리며, 다중 `Set-Cookie`는 `getSetCookie()`로 개별 보존(인증 세션).
- 프론트 `fetcher`(entities/*/api)와 `apiClient`는 **변경 없음** — 계속 `/api/*` 상대경로를 호출한다.

## 환경 변수

| 변수 | 위치 | 기본값 | 설명 |
|------|------|--------|------|
| `BACKEND_ORIGIN` | 서버 전용(route handler) | `http://localhost:8080` | 실제 백엔드 origin. 프록시 대상 `${BACKEND_ORIGIN}/api/<path>`. |
| `INTERNAL_API_ORIGIN` | 서버 전용(`shared/api/client.ts`) | `http://localhost:3000` | SSR에서 apiClient가 호출하는 same-origin(=Next 자신, BFF 라우트). |
| `NEXT_PUBLIC apiBaseUrl` | 클라이언트 | `/api` | 브라우저 apiClient prefix. |

## MSW(mock)와의 관계

- 개발/mock 구간: MSW가 `/api/*`를 **먼저 가로채므로** BFF 라우트까지 도달하지 않는다 → 기존 mock 개발 흐름 그대로 유지.
- 백엔드 연결: MSW 비활성 + `BACKEND_ORIGIN` 설정 시 BFF가 실제 백엔드로 프록시.

## 왜 BFF인가

- 백엔드 origin/스킴/인증 헤더 처리를 **한 곳**으로 일원화 — 프론트 코드는 백엔드 위치를 모른다.
- 브라우저는 same-origin `/api/*`만 보므로 CORS·혼합콘텐츠 이슈 없음, 쿠키 세션 전달 단순.
- 도메인별 가공이 필요해지면 catch-all 대신/추가로 엔드포인트별 `route.ts`로 확장 가능(현재는 투명 프록시).
