import type { ComponentPropsWithRef } from "react";

export interface FrameRootProps extends ComponentPropsWithRef<"iframe"> {
  /** iframe 소스 URL */
  src?: string;
  /** 접근성을 위한 제목 (필수) */
  title: string;
  /** 샌드박스 속성 */
  sandbox?: string;
  /** 로딩 전략 */
  loading?: "eager" | "lazy";
}
