/**
 * Presence 머신 타입 정의
 * 마운트/언마운트 애니메이션을 관리하는 머신
 */

export type PresenceState = "mounted" | "unmounted" | "entering" | "exiting";

export interface PresenceContext {
  /** 외부에서 제어하는 present 상태 */
  present: boolean;
  /** 애니메이션 사용 여부 */
  animationEnabled: boolean;
}

export type PresenceEvent = { type: "MOUNT" } | { type: "UNMOUNT" } | { type: "ANIMATION_END" };
