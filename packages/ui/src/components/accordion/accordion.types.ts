/**
 * Accordion React 컴포넌트 타입 정의
 */

/** single 모드 props */
export interface AccordionSingleProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single";
  /** 열려있는 아이템 값 (controlled) */
  value?: string;
  /** 기본 열려있는 값 (uncontrolled) */
  defaultValue?: string;
  /** 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 모든 아이템을 접을 수 있는지 */
  collapsible?: boolean;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

/** multiple 모드 props */
export interface AccordionMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
  type: "multiple";
  /** 열려있는 아이템 값 배열 (controlled) */
  value?: string[];
  /** 기본 열려있는 값 배열 (uncontrolled) */
  defaultValue?: string[];
  /** 값 변경 콜백 */
  onValueChange?: (value: string[]) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

export type AccordionRootProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이템 값 (필수) */
  value: string;
  /** 비활성화 */
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface AccordionIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface AccordionContextValue {
  value: string[];
  getItemProps: (props: { value: string; disabled?: boolean }) => Record<string, unknown>;
  getItemTriggerProps: (props: { value: string; disabled?: boolean }) => Record<string, unknown>;
  getItemContentProps: (props: { value: string }) => Record<string, unknown>;
  getItemIndicatorProps: (props: { value: string }) => Record<string, unknown>;
  registerItem: (item: { value: string; disabled?: boolean }) => void;
  unregisterItem: (value: string) => void;
}

/** Item Context — 각 Item 내부에서 value/disabled 공유 */
export interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
}
