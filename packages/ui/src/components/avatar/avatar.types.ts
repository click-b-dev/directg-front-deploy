import type { ComponentPropsWithRef, ReactNode } from "react";

export interface AvatarRootProps extends ComponentPropsWithRef<"div"> {
  children?: ReactNode;
}

export interface AvatarImageProps extends Omit<ComponentPropsWithRef<"img">, "onLoad" | "onError"> {
  /** 이미지 소스 */
  src?: string;
  /** 이미지 alt 텍스트 */
  alt?: string;
  /** 이미지 로드 완료 콜백 */
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

export interface AvatarFallbackProps extends ComponentPropsWithRef<"span"> {
  children?: ReactNode;
}
