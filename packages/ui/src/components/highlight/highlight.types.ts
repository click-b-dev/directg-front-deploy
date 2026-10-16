import type { ComponentPropsWithRef } from "react";

export interface HighlightRootProps extends ComponentPropsWithRef<"span"> {
  /** 전체 텍스트 */
  text: string;
  /** 검색 쿼리 */
  query: string;
  /** 모든 일치 항목 하이라이트 (false일 경우 첫 번째만) */
  matchAll?: boolean;
  /** 대소문자 무시 */
  ignoreCase?: boolean;
}
