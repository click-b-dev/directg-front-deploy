/**
 * PinInput 상태머신 타입 정의
 * WAI-ARIA: 단일 문자 입력 그룹
 */

/** PinInput 상태 */
export type PinInputState = "idle" | "focused";

/** PinInput 컨텍스트 */
export interface PinInputContext {
  /** 각 입력 필드의 값 배열 */
  value: string[];
  /** 입력 필드 개수 */
  length: number;
  /** OTP 모드 (autocomplete="one-time-code") */
  otp: boolean;
  /** 값 마스킹 (password처럼 표시) */
  mask: boolean;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 현재 포커스된 입력 인덱스 (-1이면 없음) */
  focusedIndex: number;
  /** 허용 패턴 (정규식 문자열) */
  pattern: string;
  /** placeholder */
  placeholder: string;
  /** 폼 필드 이름 */
  name?: string;
  /** 필수 입력 */
  required: boolean;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** PinInput 이벤트 */
export type PinInputEvent =
  | { type: "INPUT"; index: number; value: string }
  | { type: "PASTE"; index: number; value: string }
  | { type: "BACKSPACE"; index: number }
  | { type: "DELETE"; index: number }
  | { type: "FOCUS"; index: number }
  | { type: "BLUR" }
  | { type: "KEY_DOWN"; index: number; key: string }
  | { type: "SET_VALUE"; value: string[] }
  | { type: "CLEAR" }
  | { type: "SET_CONTEXT"; context: Partial<PinInputContext> };
