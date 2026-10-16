/**
 * Splitter React 컴포넌트 타입 정의
 */

import type { ReactNode } from "react";
import type { PanelConstraint } from "@/machines/splitter/types";

export interface SplitterRootProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> {
  /** 각 패널 크기 배열 (%, controlled) */
  sizes?: number[];
  /** 기본 크기 배열 (%, uncontrolled) */
  defaultSizes?: number[];
  /** 크기 변경 콜백 */
  onSizesChange?: (sizes: number[]) => void;
  /** 방향 */
  orientation?: "horizontal" | "vertical";
  /** 비활성화 */
  disabled?: boolean;
  /** 패널 제약 조건 */
  panels?: PanelConstraint[];
  /** 키보드 리사이즈 단위 (%, 기본 1) */
  step?: number;
  children?: ReactNode;
}

export interface SplitterPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 패널 인덱스 */
  index: number;
  children?: ReactNode;
}

export interface SplitterResizeTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 핸들 인덱스 (좌측 패널 인덱스와 동일) */
  index: number;
  children?: ReactNode;
}

export interface SplitterContextValue {
  sizes: number[];
  getPanelProps: (props: { index: number }) => Record<string, unknown>;
  getResizeTriggerProps: (props: { index: number }) => Record<string, unknown>;
}
