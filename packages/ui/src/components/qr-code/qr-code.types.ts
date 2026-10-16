import type { ComponentPropsWithRef, ReactNode } from "react";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeRootProps extends ComponentPropsWithRef<"div"> {
  /** 인코딩할 문자열 값 */
  value: string;
  /** QR 코드 크기 (px) */
  size?: number;
  /** 에러 보정 레벨 */
  encoding?: ErrorCorrectionLevel;
  children?: ReactNode;
}

export type QRCodeFrameProps = ComponentPropsWithRef<"svg">;

export type QRCodePatternProps = ComponentPropsWithRef<"path">;

export interface QRCodeOverlayProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}
