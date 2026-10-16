import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * legacy 모바일은 ionicons@5.5.2 웹 컴포넌트(`<ion-icon>`)를 CDN으로 로드한다.
 * React/TSX에서 커스텀 엘리먼트를 인식하도록 JSX 타입을 선언한다(마크업 parity 유지).
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        role?: string;
        "aria-label"?: string;
      };
    }
  }
}

export {};
