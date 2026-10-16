/**
 * Toast 상태머신 타입 정의
 * WAI-ARIA Alert 패턴 + 자동 닫힘 알림
 */

/** 개별 Toast 상태 */
export type ToastState = "entering" | "visible" | "exiting" | "dismissed";

/** Toast 타입 */
export type ToastType = "info" | "success" | "warning" | "error";

/** Toast 배치 위치 */
export type ToastPlacement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end";

/** 개별 Toast 데이터 */
export interface ToastData {
  /** 고유 ID */
  id: string;
  /** 토스트 타입 */
  type: ToastType;
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 자동 닫힘 시간 (ms, 0이면 수동 닫기만 가능) */
  duration: number;
  /** 액션 버튼 라벨 */
  actionLabel?: string;
  /** 액션 콜백 */
  onAction?: () => void;
  /** 닫힘 콜백 */
  onClose?: () => void;
}

/** 개별 Toast 컨텍스트 */
export interface ToastContext {
  /** 토스트 데이터 */
  data: ToastData;
  /** 호버 중 여부 */
  paused: boolean;
  /** 남은 시간 (ms) */
  remaining: number;
  /** 타이머 시작 시간 */
  timerStartedAt: number;
}

/** 개별 Toast 이벤트 */
export type ToastEvent =
  | { type: "ENTER_DONE" }
  | { type: "DISMISS" }
  | { type: "EXIT_DONE" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SET_CONTEXT"; context: Partial<ToastContext> };

/** Toast Group 컨텍스트 (Toaster) */
export interface ToastGroupContext {
  /** 활성 토스트 목록 */
  toasts: ToastContext[];
  /** 배치 위치 */
  placement: ToastPlacement;
  /** 최대 동시 표시 개수 (0이면 무제한) */
  max: number;
  /** 기본 자동 닫힘 시간 (ms) */
  defaultDuration: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** Toast Group 이벤트 */
export type ToastGroupEvent =
  | {
      type: "ADD_TOAST";
      toast: Omit<ToastData, "id" | "duration"> & { id?: string; duration?: number };
    }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "PAUSE_TOAST"; id: string }
  | { type: "RESUME_TOAST"; id: string }
  | { type: "DISMISS_ALL" }
  | { type: "SET_CONTEXT"; context: Partial<ToastGroupContext> };
