/**
 * Steps React 컴포넌트 타입 정의
 */

export interface StepsRootProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 현재 스텝 (controlled, 0-based) */
  step?: number;
  /** 기본 스텝 (uncontrolled) */
  defaultStep?: number;
  /** 스텝 변경 콜백 */
  onStepChange?: (step: number) => void;
  /** 전체 스텝 수 */
  count: number;
  /** 순차 모드 (true: 이전/다음만 가능) */
  linear?: boolean;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

export interface StepsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface StepsItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스텝 인덱스 (0-based, 필수) */
  index: number;
  children?: React.ReactNode;
}

export interface StepsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 스텝 인덱스 (0-based, 필수) */
  index: number;
  children?: React.ReactNode;
}

export interface StepsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스텝 인덱스 (0-based, 필수) */
  index: number;
  children?: React.ReactNode;
}

export interface StepsIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스텝 인덱스 (0-based, 필수) */
  index: number;
  children?: React.ReactNode;
}

export interface StepsSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 스텝 인덱스 (0-based, 필수) */
  index: number;
  children?: React.ReactNode;
}

export interface StepsNextTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface StepsPrevTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface StepsProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/** 내부 Context */
export interface StepsContextValue {
  step: number;
  count: number;
  percent: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  getRootProps: () => Record<string, unknown>;
  getListProps: () => Record<string, unknown>;
  getItemProps: (props: { index: number }) => Record<string, unknown>;
  getTriggerProps: (props: { index: number }) => Record<string, unknown>;
  getContentProps: (props: { index: number }) => Record<string, unknown>;
  getIndicatorProps: (props: { index: number }) => Record<string, unknown>;
  getSeparatorProps: (props: { index: number }) => Record<string, unknown>;
  getNextTriggerProps: () => Record<string, unknown>;
  getPrevTriggerProps: () => Record<string, unknown>;
  getProgressProps: () => Record<string, unknown>;
}
