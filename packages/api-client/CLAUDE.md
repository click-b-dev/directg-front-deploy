# @click-b/api-client

## 역할

API 호출을 위한 공유 HTTP 클라이언트. 인프라 레벨 전용.

## 의존성 규칙

- **허용:** `@click-b/types`만
- **금지:** `@click-b/utils`, `@click-b/ui`, `@click-b/hook`, React
- 브라우저 fetch API 또는 별도 HTTP 라이브러리 사용

## Export 맵

| import 경로           | 설명                         |
| --------------------- | ---------------------------- |
| `@click-b/api-client` | API 클라이언트 barrel export |

## 코드 컨벤션

- 기본 HTTP 메서드 래퍼: `get`, `post`, `put`, `patch`, `delete`
- 응답 타입은 제네릭으로 처리: `get<T>(url): Promise<T>`
- 인터셉터 패턴: 인증 토큰 주입, 에러 변환
- `@click-b/types`의 API 관련 타입(ApiResponse, PaginatedResponse) 사용
- React Hook으로 만들지 않는다 — 순수 async 함수

## 파일 구조

```
src/
  index.ts           → barrel export
  client.ts          → HTTP 클라이언트 팩토리
  interceptors.ts    → 요청/응답 인터셉터
  error.ts           → API 에러 타입/변환
```

## 명령어

| 명령어                                    | 설명            |
| ----------------------------------------- | --------------- |
| `pnpm --filter @click-b/api-client build` | 클라이언트 빌드 |

## 주의사항

- React Query 통합은 앱의 `entities/<name>/query.ts`에서 수행
- 이 패키지는 React에 의존하지 않는다
- 도메인별 API 함수(fetchUsers, createProduct 등)는 앱의 `entities/<name>/fetcher.ts`에 위치
- 여기에는 **인프라 레벨** 클라이언트만 (base URL, 인터셉터, 에러 변환)
