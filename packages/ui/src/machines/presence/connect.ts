/**
 * Presence connect
 * 머신 상태를 UI 속성으로 변환한다.
 */

import type { Send } from "@/machines/shared/types";
import type { PresenceState, PresenceContext, PresenceEvent } from "./types";

export interface PresenceConnectReturn {
  /** DOM에 콘텐츠가 존재해야 하는지 여부 */
  isPresent: boolean;
  /** 완전히 마운트(entering 완료)된 상태인지 */
  isMounted: boolean;
  /** 현재 상태 */
  state: PresenceState;
  /** animationend 이벤트 핸들러 */
  onAnimationEnd: () => void;
}

export function connectPresence(
  state: PresenceState,
  _context: PresenceContext,
  send: Send<PresenceEvent>,
): PresenceConnectReturn {
  return {
    isPresent: state !== "unmounted",
    isMounted: state === "mounted",
    state,
    onAnimationEnd() {
      send({ type: "ANIMATION_END" });
    },
  };
}
