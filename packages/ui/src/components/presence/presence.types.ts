/**
 * Presence 컴포넌트 Props
 */

import type { ReactNode } from "react";

export interface PresenceProps {
  /** 콘텐츠 표시 여부 */
  present: boolean;
  /** 애니메이션 사용 여부 (기본: true) */
  animationEnabled?: boolean;
  /** exit 애니메이션 완료 후 콜백 */
  onExitComplete?: () => void;
  children: ReactNode | ((props: { state: string; isPresent: boolean }) => ReactNode);
}
