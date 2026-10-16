# @click-b/utils

## 역할

모노레포 전체에서 공유하는 범용 유틸리티 함수 패키지. 대부분은 순수 함수이며, 일부 모듈은 브라우저 API를 얇게 감싼다.

## 의존성 규칙

- **허용:** `@click-b/types`만
- **금지:** `@click-b/ui`, `@click-b/hook`, `@click-b/api-client`, React, Node.js API
- 기본 원칙은 프레임워크 비의존 순수 함수다.
- 단, `cookie`, `storage`, `url`처럼 패키지 목적에 직접 맞는 브라우저 API 래퍼는 허용한다.

## Export 맵

| import 경로                    | 설명                          |
| ------------------------------ | ----------------------------- |
| `@click-b/utils`               | 모든 유틸리티의 barrel export |
| `@click-b/utils/assert`        | assertion 전용 모듈           |
| `@click-b/utils/search-params` | query string 상태 직렬화 모듈 |
| `@click-b/utils/intl`          | locale-aware 포맷 모듈        |

## 코드 컨벤션

- 모든 함수는 **순수 함수** (side effect 없음)
- 카테고리별 디렉토리 분리: `src/string/`, `src/date/`, `src/assert/` 등
- 각 함수는 TypeScript 제네릭으로 타입 안전하게 작성
- React, 앱 프레임워크, Node 특화 코드 금지
- DOM 직접 사용은 `cookie`, `storage`, `url` 같은 전용 래퍼 모듈로 한정
- 모듈 책임과 use-case는 `MODULES.md`를 기준으로 유지

## 파일 구조

```
src/
  index.ts       → barrel export
  assert/        → assertion 유틸
  cookie/        → cookie 유틸
  date/          → 고정 포맷 날짜 유틸
  function/      → debounce/throttle
  http/          → HTTP 상수/가드
  intl/          → locale-aware 포맷 유틸
  number/        → 숫자/통화/퍼센트 유틸
  object/        → 객체 유틸
  search-params/ → schema 기반 query string 유틸
  storage/       → local/session storage 유틸
  string/        → 문자열 유틸
  type-guard/    → 타입 가드 함수
  url/           → URL 검증 및 기본 query string 유틸
```

## 명령어

| 명령어                               | 설명 |
| ------------------------------------ | ---- |
| `pnpm --filter @click-b/utils build` | 빌드 |

## 주의사항

- React Hook은 `@click-b/hook`에, 컴포넌트는 `@click-b/ui`에 위치
- `useXxx` 패턴의 함수를 여기에 만들지 않는다
- 비즈니스 로직(가격 계산, 세금 등)은 앱의 `entities/` 또는 `shared/lib/`에 위치
- 새 모듈을 추가할 때는 `MODULES.md`에 정의, 대표 use-case, out-of-scope를 함께 기록
