/**
 * Toast 상태머신
 * 순수 함수 — React 의존성 없음
 *
 * 개별 Toast는 entering → visible → exiting → dismissed 상태를 거침.
 * ToastGroup은 여러 Toast를 관리하는 컨테이너 역할.
 */

import type { TransitionResult } from "@/machines/shared";
import type {
  ToastState,
  ToastContext,
  ToastEvent,
  ToastGroupContext,
  ToastGroupEvent,
  ToastData,
} from "./types";

/* ─── 개별 Toast 머신 ─── */

export function toastTransition(
  state: ToastState,
  ctx: ToastContext,
  event: ToastEvent,
): TransitionResult<ToastState, ToastContext> {
  switch (state) {
    case "entering": {
      switch (event.type) {
        case "ENTER_DONE":
          return {
            state: "visible",
            context: {
              ...ctx,
              timerStartedAt: Date.now(),
              remaining: ctx.data.duration,
            },
          };
        case "DISMISS":
          return { state: "exiting", context: ctx };
        case "SET_CONTEXT":
          return { state, context: { ...ctx, ...event.context } };
        default:
          return { state, context: ctx };
      }
    }

    case "visible": {
      switch (event.type) {
        case "DISMISS":
          return { state: "exiting", context: ctx };
        case "PAUSE": {
          const elapsed = Date.now() - ctx.timerStartedAt;
          const remaining = Math.max(ctx.remaining - elapsed, 0);
          return {
            state: "visible",
            context: { ...ctx, paused: true, remaining },
          };
        }
        case "RESUME":
          return {
            state: "visible",
            context: {
              ...ctx,
              paused: false,
              timerStartedAt: Date.now(),
            },
          };
        case "SET_CONTEXT":
          return { state, context: { ...ctx, ...event.context } };
        default:
          return { state, context: ctx };
      }
    }

    case "exiting": {
      switch (event.type) {
        case "EXIT_DONE":
          return { state: "dismissed", context: ctx };
        case "SET_CONTEXT":
          return { state, context: { ...ctx, ...event.context } };
        default:
          return { state, context: ctx };
      }
    }

    case "dismissed":
      return { state, context: ctx };

    default:
      return { state, context: ctx };
  }
}

/* ─── Toast Group 머신 ─── */

let toastCounter = 0;

function generateToastId(): string {
  return `toast-${++toastCounter}`;
}

/** "idle" 단일 상태 — Group은 상태 전이가 없고 컨텍스트만 변경 */
export type ToastGroupState = "active";

export function toastGroupTransition(
  state: ToastGroupState,
  ctx: ToastGroupContext,
  event: ToastGroupEvent,
): TransitionResult<ToastGroupState, ToastGroupContext> {
  switch (event.type) {
    case "ADD_TOAST": {
      const id = event.toast.id ?? generateToastId();
      const duration = event.toast.duration ?? ctx.defaultDuration;

      const toastData: ToastData = {
        ...event.toast,
        id,
        duration,
      };

      const toastCtx: ToastContext = {
        data: toastData,
        paused: false,
        remaining: duration,
        timerStartedAt: Date.now(),
      };

      let nextToasts = [...ctx.toasts, toastCtx];

      // max 제한 적용 — 오래된 것부터 제거
      if (ctx.max > 0 && nextToasts.length > ctx.max) {
        nextToasts = nextToasts.slice(nextToasts.length - ctx.max);
      }

      return {
        state,
        context: { ...ctx, toasts: nextToasts },
      };
    }

    case "DISMISS_TOAST": {
      const nextToasts = ctx.toasts.map((t) => {
        if (t.data.id !== event.id) return t;
        // exiting 상태로 전환 표시
        return { ...t, remaining: 0 };
      });
      return { state, context: { ...ctx, toasts: nextToasts } };
    }

    case "REMOVE_TOAST": {
      const nextToasts = ctx.toasts.filter((t) => t.data.id !== event.id);
      return { state, context: { ...ctx, toasts: nextToasts } };
    }

    case "PAUSE_TOAST": {
      const nextToasts = ctx.toasts.map((t) => {
        if (t.data.id !== event.id) return t;
        const elapsed = Date.now() - t.timerStartedAt;
        const remaining = Math.max(t.remaining - elapsed, 0);
        return { ...t, paused: true, remaining };
      });
      return { state, context: { ...ctx, toasts: nextToasts } };
    }

    case "RESUME_TOAST": {
      const nextToasts = ctx.toasts.map((t) => {
        if (t.data.id !== event.id) return t;
        return { ...t, paused: false, timerStartedAt: Date.now() };
      });
      return { state, context: { ...ctx, toasts: nextToasts } };
    }

    case "DISMISS_ALL": {
      const nextToasts = ctx.toasts.map((t) => ({
        ...t,
        remaining: 0,
      }));
      return { state, context: { ...ctx, toasts: nextToasts } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createToastGroupMachine(ctx: Partial<ToastGroupContext> & { id: string }) {
  const initialContext: ToastGroupContext = {
    toasts: ctx.toasts ?? [],
    placement: ctx.placement ?? "bottom-end",
    max: ctx.max ?? 0,
    defaultDuration: ctx.defaultDuration ?? 5000,
    id: ctx.id,
  };

  return {
    initialState: "active" as ToastGroupState,
    initialContext,
    transition: toastGroupTransition,
  };
}
