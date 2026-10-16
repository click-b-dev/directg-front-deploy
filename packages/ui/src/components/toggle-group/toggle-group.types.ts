/**
 * ToggleGroup React 컴포넌트 타입 정의
 */

/** single 모드 props */
export interface ToggleGroupSingleProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single";
  /** 활성 아이템 값 (controlled) */
  value?: string;
  /** 기본 활성 값 (uncontrolled) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 순환 탐색 */
  loop?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

/** multiple 모드 props */
export interface ToggleGroupMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "multiple";
  /** 활성 아이템 값 배열 (controlled) */
  value?: string[];
  /** 기본 활성 값 배열 (uncontrolled) */
  defaultValue?: string[];
  /** 값 변경 콜백 */
  onValueChange?: (value: string[]) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 순환 탐색 */
  loop?: boolean;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

export type ToggleGroupRootProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

export interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 아이템 값 (필수) */
  value: string;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

/** 내부 Context */
export interface ToggleGroupContextValue {
  getItemProps: (props: { value: string; disabled?: boolean }) => Record<string, unknown>;
  registerItem: (value: string, disabled: boolean) => void;
  unregisterItem: (value: string) => void;
}
