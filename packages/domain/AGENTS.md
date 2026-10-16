# @click-b/domain

`@click-b/domain`은 프로젝트와 앱을 가로질러 재사용할 수 있는 도메인 공통 모듈 패키지다.

## Boundaries

- 허용: 순수 함수, 타입, headless React hook, UI 없는 상태 전이 규칙.
- 금지: app-local alias, 라우터, API client, React Query, UI 컴포넌트, FSD slice 직접 import.
- 서버 통신은 호출 측에서 함수로 주입한다. 이 패키지는 endpoint, query key, mutation을 소유하지 않는다.
- 스키마 라이브러리 버전 충돌을 피하기 위해 zod 같은 validator 의존성은 앱/엔티티 레이어에 둔다.

## Modules

- `identity`: 휴대폰/생년월일/비밀번호 같은 입력 포맷과 검증 primitive.
- `terms-agreement`: 약관 목록과 동의값을 다루는 headless hook 및 순수 함수.
- `verification-code`: 인증번호 발송/검증 플로우의 상태, 만료 시간, 카운트다운 hook.
