# @click-b/domain Modules

`@click-b/domain`은 앱 화면에 박혀 있던 반복 업무 규칙을 재사용 가능한 headless 모듈로 분리한다.

## 원칙

- UI, 라우터, API client, React Query에 의존하지 않는다.
- 서버 요청은 호출 측에서 함수로 주입한다.
- 앱별 schema 조립은 앱/엔티티 레이어가 맡고, 여기에는 schema 라이브러리를 추가하지 않는다.
- 화면에서 바로 쓸 수 있는 custom hook과 테스트하기 쉬운 순수 함수를 같이 제공한다.

## 모듈 맵

| 모듈 | import 경로 | 책임 | 대표 use-case |
| --- | --- | --- | --- |
| `identity` | `@click-b/domain/identity` | 휴대폰/생년월일/비밀번호 입력 primitive | 회원가입, 비밀번호 재설정, 본인 인증 |
| `terms-agreement` | `@click-b/domain/terms-agreement` | 약관 동의값, 전체동의, 필수동의 계산 | 회원가입 약관, 정책 동의 화면 |
| `verification-code` | `@click-b/domain/verification-code` | 인증번호 발송/검증 상태와 만료 countdown | SMS/이메일 OTP, 재발송 제한 |

## 경계

- `@click-b/hook`: 브라우저/UI primitive 전용.
- `@click-b/domain`: 프로젝트 도메인 규칙 전용.
- `apps/*/src/entities`: 실제 API 계약, query/mutation, zod schema 전용.
