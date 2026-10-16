# @click-b/domain

`@click-b/domain`은 도메인 공통 규칙을 UI와 API에서 분리해 재사용하기 위한 패키지다.

## Rules

- UI 컴포넌트, 라우터, app-local FSD alias, React Query, API client를 import하지 않는다.
- 앱별 서버 통신은 `send`, `verify` 같은 함수 주입으로 받는다.
- validator 의존성은 추가하지 않는다. zod v3/v4처럼 앱별 버전이 다를 수 있는 도구는 호출 측에서 조립한다.
- 새 모듈은 `src/<module>/index.ts`와 public export를 함께 추가한다.

## Public Imports

| import 경로 | 책임 |
| --- | --- |
| `@click-b/domain` | 전체 public API barrel |
| `@click-b/domain/identity` | 입력 포맷/검증 primitive |
| `@click-b/domain/terms-agreement` | 약관 동의 상태와 hook |
| `@click-b/domain/verification-code` | 인증번호 상태와 countdown hook |
