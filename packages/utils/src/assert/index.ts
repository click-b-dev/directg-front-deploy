/**
 * 런타임 invariant와 TypeScript narrowing을 위한 assertion 모듈.
 *
 * 정의:
 * - recover 가능한 사용자 입력 에러가 아니라, 개발자가 "여기서는 반드시 성립해야 한다"고
 *   선언하는 전제를 명시적으로 검증하는 얇은 유틸 레이어다.
 * - `asserts` 시그니처를 통해 런타임 검증과 타입 좁히기를 동시에 제공한다.
 *
 * use case:
 * - nullable 값이 이후 로직에서 반드시 존재해야 할 때
 * - switch exhaustive check에서 누락된 분기를 잡고 싶을 때
 * - API 응답/설정값을 앱 내부 불변식으로 승격할 때
 *
 * out of scope:
 * - 폼 validation, 사용자 입력 에러 메시지 구성
 * - 비즈니스 규칙 자체를 판정하는 도메인 로직
 */

/**
 * 개발자 전제가 깨졌을 때 즉시 예외를 던진다.
 *
 * 인터페이스:
 * - 입력: truthy/falsy로 판별 가능한 조건식과 에러 메시지 또는 Error 객체
 * - 출력: 반환값은 없고, 실패 시 예외를 던진다
 * - 타입 효과: 성공 경로에서 `condition`을 좁혀 이후 코드에서 non-null 전제로 사용할 수 있다
 *
 * use case:
 * - nullable 값이 이후 렌더/계산 단계에서 반드시 존재해야 할 때
 * - 환경변수, 설정값, query data 같은 필수 전제를 명시할 때
 *
 * @example
 * assert(user, "user must exist before rendering");
 * user.id;
 */
export const assert: (condition: unknown, message: string | Error) => asserts condition = (
  condition,
  message,
) => {
  if (condition) {
    return;
  }

  throw typeof message === "string" ? new Error(message) : message;
};

/**
 * exhaustive check 실패를 명시한다.
 *
 * 인터페이스:
 * - 입력: 타입 시스템상 `never`여야 하는 값과 선택적 메시지
 * - 출력: 항상 예외를 던지므로 `never`
 *
 * use case:
 * - discriminated union `switch`에서 누락된 분기를 런타임에도 드러내고 싶을 때
 *
 * @example
 * switch (status) {
 *   case "idle":
 *   case "loading":
 *     return;
 *   default:
 *     return assertNever(status);
 * }
 */
export const assertNever = (value: never, message = "Unexpected value reached"): never => {
  throw new Error(`${message}: ${String(value)}`);
};
