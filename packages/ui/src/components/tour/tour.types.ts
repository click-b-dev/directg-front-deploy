/**
 * Tour React 컴포넌트 타입 정의
 */

import type { ReactNode } from "react";
import type { TourStep } from "@/machines/tour/types";
import type { TourAction } from "@/machines/tour/connect";

export interface TourRootProps {
  /** 스텝 배열 */
  steps: TourStep[];
  /** 열림 상태 (controlled) */
  open?: boolean;
  /** 기본 열림 상태 (uncontrolled) */
  defaultOpen?: boolean;
  /** 열림 상태 변경 콜백 */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface TourBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TourPositionerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TourContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TourTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode;
}

export interface TourDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface TourProgressTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export interface TourCloseTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export interface TourActionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 액션 타입 */
  action: TourAction;
  children?: ReactNode;
}

export interface TourArrowProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TourSpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface TourContextValue {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | undefined;
  isFirstStep: boolean;
  isLastStep: boolean;
  progressText: string;
  getBackdropProps: () => Record<string, unknown>;
  getPositionerProps: () => Record<string, unknown>;
  getContentProps: () => Record<string, unknown>;
  getTitleProps: () => Record<string, unknown>;
  getDescriptionProps: () => Record<string, unknown>;
  getProgressTextProps: () => Record<string, unknown>;
  getCloseTriggerProps: () => Record<string, unknown>;
  getActionTriggerProps: (props: { action: TourAction }) => Record<string, unknown>;
  getArrowProps: () => Record<string, unknown>;
  getSpotlightProps: () => Record<string, unknown>;
}
