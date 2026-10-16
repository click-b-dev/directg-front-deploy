/**
 * TagsInput 상태머신 타입 정의
 * WAI-ARIA: 태그 목록 관리 입력
 */

/** TagsInput 상태 */
export type TagsInputState = "idle" | "focused" | "editing";

/** TagsInput 컨텍스트 */
export interface TagsInputContext {
  /** 태그 값 배열 */
  value: string[];
  /** 현재 입력 값 */
  inputValue: string;
  /** 인라인 편집 중인 태그 인덱스 (-1이면 편집 중 아님) */
  editedTagIndex: number;
  /** 인라인 편집 중인 태그의 현재 값 */
  editedTagValue: string;
  /** 비활성화 */
  disabled: boolean;
  /** 읽기 전용 */
  readOnly: boolean;
  /** 최대 태그 개수 (0이면 무제한) */
  max: number;
  /** 태그 추가 시 구분자 */
  delimiter: string;
  /** 중복 허용 여부 */
  allowDuplicates: boolean;
  /** placeholder */
  placeholder: string;
  /** 폼 필드 이름 */
  name?: string;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** TagsInput 이벤트 */
export type TagsInputEvent =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT_CHANGE"; value: string }
  | { type: "ADD_TAG"; value: string }
  | { type: "REMOVE_TAG"; index: number }
  | { type: "CLEAR_ALL" }
  | { type: "KEY_DOWN"; key: string }
  | { type: "PASTE"; value: string }
  | { type: "TAG_CLICK"; index: number }
  | { type: "EDIT_TAG_CHANGE"; value: string }
  | { type: "EDIT_TAG_COMMIT" }
  | { type: "EDIT_TAG_CANCEL" }
  | { type: "EDIT_TAG_KEY_DOWN"; key: string }
  | { type: "SET_VALUE"; value: string[] }
  | { type: "SET_CONTEXT"; context: Partial<TagsInputContext> };
