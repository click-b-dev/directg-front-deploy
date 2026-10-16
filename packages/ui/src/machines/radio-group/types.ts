export type RadioGroupState = "idle" | "focused";

export interface RadioGroupContext {
  /** 현재 선택된 값 */
  value: string | null;
  /** 비활성화 여부 */
  disabled: boolean;
  /** 읽기 전용 여부 */
  readOnly: boolean;
  /** 필수 입력 여부 */
  required: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 방향 (키보드 탐색에 영향) */
  orientation: "horizontal" | "vertical";
  /** 순환 탐색 여부 */
  loop: boolean;
  /** 포커스된 아이템의 값 */
  focusedValue: string | null;
}

export type RadioGroupEvent =
  | { type: "SET_VALUE"; value: string }
  | { type: "FOCUS"; value: string }
  | { type: "BLUR" }
  | { type: "KEY_DOWN"; key: string; items: string[] }
  | { type: "SET_CONTEXT"; context: Partial<RadioGroupContext> };
