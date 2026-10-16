# @click-b/api-client

상위 [packages/AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/AGENTS.md)와 루트 [AGENTS.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/AGENTS.md)를 함께 따르되, 충돌 시 [CLAUDE.md](/Users/jaeyoung/repos/click-b/fe-boilerplate/packages/api-client/CLAUDE.md)를 우선한다.

## 역할

API 호출을 위한 공유 HTTP 클라이언트. 인프라 레벨 전용이다.

## 의존성 규칙

- 허용: `@click-b/types`만
- 금지: `@click-b/utils`, `@click-b/ui`, `@click-b/hook`, React
- 브라우저 fetch API 또는 별도 HTTP 라이브러리 사용

## 코드 규칙

- 기본 HTTP 메서드 래퍼는 `get`, `post`, `put`, `patch`, `delete`로 유지한다.
- 응답 타입은 제네릭으로 처리한다.
- 인증 토큰 주입, 공통 에러 변환은 인터셉터 계층에 둔다.
- React Hook으로 만들지 않는다. 순수 async 함수만 둔다.

## 주의사항

- React Query 통합은 앱의 `entities/<name>/query.ts`에서 수행한다.
- 도메인별 API 함수는 앱의 `entities/<name>/fetcher.ts`에 둔다.
- 이 패키지에는 인프라 레벨 클라이언트만 둔다.
