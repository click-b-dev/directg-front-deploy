/**
 * Toggle React 컴포넌트 타입 정의
 * WAI-ARIA: aria-pressed 토글 버튼
 */

export interface ToggleRootProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 눌림 상태 (controlled) */
  pressed?: boolean;
  /** 기본 눌림 상태 (uncontrolled) */
  defaultPressed?: boolean;
  /** 눌림 상태 변경 콜백 */
  onPressedChange?: (pressed: boolean) => void;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}
