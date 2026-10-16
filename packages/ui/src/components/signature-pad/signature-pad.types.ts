/**
 * SignaturePad 컴포넌트 Props
 */

import type { ComponentPropsWithRef, ReactNode, SVGAttributes } from "react";
import type { StrokePath } from "@/machines/signature-pad/types";

export interface SignaturePadRootProps {
  /** 제어 모드: 획 데이터 */
  paths?: StrokePath[];
  /** 제어 모드: 획 변경 콜백 */
  onPathsChange?: (paths: StrokePath[]) => void;
  /** 비활성화 */
  disabled?: boolean;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 컴포넌트 ID */
  id?: string;
  children: ReactNode;
}

export interface SignaturePadControlProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export type SignaturePadSegmentProps = SVGAttributes<SVGPathElement> & {
  /** 획 인덱스 */
  index: number;
};

export type SignaturePadCurrentSegmentProps = SVGAttributes<SVGPathElement>;

export type SignaturePadGuideProps = ComponentPropsWithRef<"div">;

export interface SignaturePadClearTriggerProps extends ComponentPropsWithRef<"button"> {
  children: ReactNode;
}

export interface SignaturePadLabelProps extends ComponentPropsWithRef<"label"> {
  children: ReactNode;
}
