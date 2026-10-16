/**
 * NumberInput 상태머신 타입 정의
 * WAI-ARIA SpinButton 패턴
 */

/** NumberInput 상태 */
export type NumberInputState = "idle" | "focused" | "spinning";

/** NumberInput 컨텍스트 */
export interface NumberInputContext {
  /** 현재 값 */
  value: number;
  /** 최솟값 */
  min: number;
  /** 최댓값 */
  max: number;
  /** 증감 단위 */
  step: number;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 필수 입력 */
  required: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 입력 필드에 표시되는 텍스트 값 */
  inputValue: string;
  /** 스피닝 방향 (연속 증감 시) */
  spinDirection: "increment" | "decrement" | null;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** NumberInput 이벤트 */
export type NumberInputEvent =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "INCREMENT_BY"; amount: number }
  | { type: "DECREMENT_BY"; amount: number }
  | { type: "SET_TO_MIN" }
  | { type: "SET_TO_MAX" }
  | { type: "INPUT_CHANGE"; inputValue: string }
  | { type: "INPUT_BLUR" }
  | { type: "INPUT_FOCUS" }
  | { type: "SPIN_START"; direction: "increment" | "decrement" }
  | { type: "SPIN_STOP" }
  | { type: "KEY_DOWN"; key: string }
  | { type: "SET_VALUE"; value: number }
  | { type: "SET_CONTEXT"; context: Partial<NumberInputContext> };
