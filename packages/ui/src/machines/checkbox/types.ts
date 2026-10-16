export type CheckedState = boolean | "indeterminate";

export type CheckboxState = "checked" | "unchecked" | "indeterminate";

export interface CheckboxContext {
  /** 현재 checked 상태 */
  checked: CheckedState;
  /** 비활성화 여부 */
  disabled: boolean;
  /** 읽기 전용 여부 */
  readOnly: boolean;
  /** 필수 입력 여부 */
  required: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 폼 필드 값 */
  value: string;
}

export type CheckboxEvent =
  | { type: "TOGGLE" }
  | { type: "SET_CHECKED"; checked: CheckedState }
  | { type: "SET_CONTEXT"; context: Partial<CheckboxContext> };
