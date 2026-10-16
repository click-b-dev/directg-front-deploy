import type { ComponentPropsWithRef, ReactNode } from "react";

export interface SegmentedControlRootProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue"
> {
  /** controlled 선택 값 */
  value?: string;
  /** uncontrolled 기본 선택 값 */
  defaultValue?: string;
  /** 선택 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 탐색 방향 */
  orientation?: "horizontal" | "vertical";
  /** 순환 탐색 여부 */
  loop?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export interface SegmentedControlItemProps extends ComponentPropsWithRef<"div"> {
  /** 아이템 값 (필수) */
  value: string;
  /** 개별 아이템 비활성화 */
  disabled?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export type SegmentedControlItemTextProps = ComponentPropsWithRef<"span">;

export type SegmentedControlItemHiddenInputProps = ComponentPropsWithRef<"input">;

export type SegmentedControlIndicatorProps = ComponentPropsWithRef<"div">;
