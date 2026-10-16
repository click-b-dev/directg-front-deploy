import type { ComponentPropsWithRef, ReactNode } from "react";

export interface RadioGroupRootProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  /** controlled 선택 값 */
  value?: string;
  /** uncontrolled 기본 선택 값 */
  defaultValue?: string;
  /** 선택 값 변경 콜백 */
  onValueChange?: (value: string) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 필수 입력 여부 */
  required?: boolean;
  /** 폼 필드 이름 */
  name?: string;
  /** 탐색 방향 */
  orientation?: "horizontal" | "vertical";
  /** 순환 탐색 여부 */
  loop?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export interface RadioGroupItemProps extends ComponentPropsWithRef<"div"> {
  /** 아이템 값 (필수) */
  value: string;
  /** 개별 아이템 비활성화 */
  disabled?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export type RadioGroupItemControlProps = ComponentPropsWithRef<"div">;

export type RadioGroupItemTextProps = ComponentPropsWithRef<"span">;

export type RadioGroupItemHiddenInputProps = ComponentPropsWithRef<"input">;

export type RadioGroupIndicatorProps = ComponentPropsWithRef<"div">;
