/**
 * DOM 유틸리티
 * 머신 connect에서 사용하는 공용 DOM 헬퍼
 */

/** 고유 ID 생성 */
let counter = 0;
export function uid(prefix = "ui"): string {
  return `${prefix}-${++counter}`;
}

/** data-* 속성에서 boolean 처리: true → "" (속성 존재), false → undefined (속성 제거) */
export function dataAttr(condition: boolean): "" | undefined {
  return condition ? "" : undefined;
}

/** aria-* boolean 속성 */
export function ariaAttr(condition: boolean): "true" | "false" {
  return condition ? "true" : "false";
}

/** 이벤트 핸들러 합성: 여러 핸들러를 순서대로 실행 */
export function composeEventHandlers<E>(
  ...handlers: (((event: E) => void) | undefined)[]
): (event: E) => void {
  return (event: E) => {
    for (const handler of handlers) {
      handler?.(event);
      if (event instanceof Event && event.defaultPrevented) break;
    }
  };
}

/** props 병합: 사용자 props와 머신 props를 안전하게 병합 */
export function mergeProps<T extends Record<string, unknown>>(
  machineProps: T,
  userProps?: Partial<T>,
): T {
  if (!userProps) return machineProps;

  const merged = { ...machineProps } as Record<string, unknown>;

  for (const key of Object.keys(userProps)) {
    const machineValue = machineProps[key];
    const userValue = userProps[key];

    // 이벤트 핸들러는 합성
    if (typeof machineValue === "function" && typeof userValue === "function") {
      merged[key] = composeEventHandlers(
        machineValue as (e: unknown) => void,
        userValue as (e: unknown) => void,
      );
    } else if (key === "className" && machineValue && userValue) {
      merged[key] = `${machineValue} ${userValue}`;
    } else if (
      key === "style" &&
      typeof machineValue === "object" &&
      typeof userValue === "object"
    ) {
      merged[key] = { ...(machineValue as object), ...(userValue as object) };
    } else if (userValue !== undefined) {
      merged[key] = userValue;
    }
  }

  return merged as T;
}

/** live region으로 메시지 announce (스크린리더) */
export function announce(message: string, politeness: "polite" | "assertive" = "polite"): void {
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", politeness);
  el.setAttribute("aria-atomic", "true");
  Object.assign(el.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: "0",
  });
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}
