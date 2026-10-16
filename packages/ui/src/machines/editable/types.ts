/**
 * Editable 상태머신 타입 정의
 * WAI-ARIA: 인라인 편집 패턴
 */

/** Editable 상태 */
export type EditableState = "preview" | "editing";

/** Editable 컨텍스트 */
export interface EditableContext {
  /** 현재 값 */
  value: string;
  /** 편집 시작 전 값 (취소 시 복원용) */
  previousValue: string;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 플레이스홀더 */
  placeholder: string;
  /** blur 시 자동 제출 여부 */
  submitOnBlur: boolean;
  /** Enter 시 제출 여부 */
  submitOnEnter: boolean;
  /** 최대 글자 수 (0이면 무제한) */
  maxLength: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Editable 이벤트 */
export type EditableEvent =
  | { type: "EDIT" }
  | { type: "CANCEL" }
  | { type: "SUBMIT" }
  | { type: "INPUT_CHANGE"; value: string }
  | { type: "KEY_DOWN"; key: string }
  | { type: "BLUR" }
  | { type: "SET_VALUE"; value: string }
  | { type: "SET_CONTEXT"; context: Partial<EditableContext> };
