/**
 * 공통 utility type 모음.
 *
 * 정의:
 * - TypeScript 내장 utility type으로 해결되지 않는 반복 패턴만 모아둔 타입 보조 레이어다.
 * - 도메인 모델이 아니라 여러 패키지에서 공통으로 재사용되는 타입 조합에 집중한다.
 *
 * use case:
 * - API 응답 모델에서 nullable/optional 조합을 읽기 쉽게 표현할 때
 * - UI props 또는 엔티티 파생 타입의 가독성을 높일 때
 * - 식별자/토큰처럼 의미적 구분이 필요한 원시값에 brand를 줄 때
 *
 * 지침:
 * - `Partial`, `Required`, `Awaited`, `NonNullable` 같은 내장 타입은 재정의하지 않는다.
 * - 한두 군데에서만 쓰이는 별칭은 여기로 올리지 않고 선언부 근처에 둔다.
 * - 새 utility type은 실제 반복 사용 사례가 생겼을 때만 추가한다.
 */
/**
 * 값이 존재하거나 명시적으로 `null`인 경우를 표현한다.
 * 예: 서버가 "값 없음"을 `null`로 내려주는 응답 필드에 사용한다.
 */
export type Nullable<T> = T | null;

/**
 * 값이 없을 수도 있고 필드 자체가 생략될 수도 있는 경우를 표현한다.
 * 예: 선택 입력값이나 optional 응답 필드 모델에 사용한다.
 */
export type Maybe<T> = Nullable<T> | undefined;

/**
 * 객체 타입의 모든 value 타입을 union으로 추출한다.
 * 예: 상수 객체에서 허용 가능한 값 집합을 만들 때 사용한다.
 */
export type ValueOf<T> = T[keyof T];

/**
 * 교차 타입이나 복잡한 mapped type 결과를 다시 평탄한 객체 형태로 정리한다.
 * 예: IDE hover에서 읽기 어려운 타입 결과를 사람이 읽기 쉽게 만들 때 사용한다.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * 같은 원시값 타입이라도 의미가 다른 식별자를 구분하기 위한 nominal typing 보조 타입이다.
 * 예: `UserId`와 `OrderId`를 모두 string으로 두지 않고 의도적으로 분리할 때 사용한다.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/**
 * 중첩 객체를 재귀적으로 optional로 만든다.
 * 예: 수정 폼의 partial payload나 설정 객체 patch 타입을 만들 때 사용한다.
 * 주의: `Date` 같은 built-in 객체에도 재귀 적용되므로 plain object 중심으로 쓰는 편이 안전하다.
 */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

/**
 * 일부 키만 다시 필수로 승격한다.
 * 예: 저장 전 draft 모델에서 특정 필드가 채워진 후속 단계 타입을 표현할 때 사용한다.
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
