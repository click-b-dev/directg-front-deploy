# @click-b/types

## 역할

모노레포 전체에서 공유하는 TypeScript 타입 계약과 인프라 레벨 utility type 정의. DAG 최하위 패키지.

## 의존성 규칙

- **허용:** 없음 (의존성 0개, 순수 타입만)
- **금지:** @click-b/\* 전부, 외부 런타임 패키지 전부
- **예외:** devDependencies에 @click-b/config (빌드 설정용)만 허용

## Export 맵

| import 경로      | 설명                           |
| ---------------- | ------------------------------ |
| `@click-b/types` | 모든 공유 타입의 barrel export |

## 코드 컨벤션

- `src/index.ts`에서 barrel export
- 타입 성격별로 파일 분리: `src/utility-types.ts`, `src/pagination.ts`, `src/env.ts` 등
- `type` keyword export만 사용 (`export type { ... }`)
- 런타임 값(enum, const, class) 포함 금지 — 순수 타입만
- Zod 스키마는 여기가 아닌 앱의 `entities/<name>/schema.ts`에 위치

## 현재 제공 기준

### utility types

- 정의: 내장 utility type으로 대체되지 않는 반복 패턴만 공통화한다.
- use case: nullable 응답, branded identifier, 복잡한 mapped type 정리, 깊은 partial 모델링
- 지침: 실제 반복 사례가 없는 타입 별칭은 추가하지 않고 선언부 근처에 둔다

유틸 타입별 설명:

- `Nullable<T>`: `T | null`. 값이 비어 있을 수 있지만 `undefined`는 허용하지 않는 API 응답 필드에 사용한다.
- `Maybe<T>`: `T | null | undefined`. 값이 없을 수도 있고 필드 자체가 생략될 수도 있는 입력/응답 모델에 사용한다.
- `ValueOf<T>`: 객체의 모든 value 타입 union을 추출한다. 상수 맵에서 허용 값 집합을 만들 때 사용한다.
- `Prettify<T>`: 복잡한 교차 타입 결과를 평탄화해 IDE와 리뷰에서 읽기 쉽게 만든다.
- `Brand<T, B>`: 같은 원시값이라도 의미가 다른 식별자를 구분하는 nominal typing 보조 타입이다.
- `DeepPartial<T>`: 중첩 객체를 재귀적으로 optional로 만든다. patch payload나 설정 일부 업데이트 타입에 사용한다.
- `WithRequired<T, K>`: 기존 타입에서 특정 키만 필수로 승격한다. draft -> submit 단계 전환 타입에 사용한다.

### pagination

- 정의: 프론트 내부 표준은 `page` + `limit` 기반 offset pagination이며, 응답 메타와 요청 파라미터를 분리한다.
- use case: `@click-b/hook`의 `usePagination`, `@click-b/api-client` 목록 응답 타입, 앱 fetcher/query 계약
- 지침: 백엔드가 `size`를 쓰더라도 내부 타입은 `limit`로 고정하고 어댑터에서만 변환한다

### env

- 정의: `@click-b/types`는 env 타입 계약만 소유하고 전역 선언 병합과 런타임 검증은 각 앱/스크립트가 담당한다.
- use case: `vite-env.d.ts`, `next-env.d.ts`, env 생성 스크립트의 기반 타입
- 지침: 공개 변수는 프레임워크 접두사 규칙(`NEXT_PUBLIC_*`, `VITE_*`)을 지키고, 서버 변수와 섞어 쓰지 않는다

## 파일 구조

```text
src/
  index.ts       → barrel export
  utility-types.ts → 공통 utility type
  pagination.ts    → offset/cursor pagination 계약
  env.ts           → framework-aware env 타입 계약
```

## 명령어

| 명령어                                           | 설명           |
| ------------------------------------------------ | -------------- |
| `pnpm --filter @click-b/types exec tsc --noEmit` | 타입 계약 검증 |

## 주의사항

- 이 패키지에 런타임 코드를 추가하면 DAG 전체가 오염됨
- 도메인 엔티티 타입(User, Product 등)은 여기가 아닌 앱의 `entities/<name>/type.ts`에 위치
- 여기에는 도메인에 무관한 **인프라 타입**만 정의 (Pagination, ApiResponse, Result 등)
