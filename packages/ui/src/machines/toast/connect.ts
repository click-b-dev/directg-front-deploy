/**
 * Toast connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type {
  ToastGroupContext,
  ToastGroupEvent,
  ToastContext,
  ToastData,
  ToastType,
  ToastPlacement,
} from "./types";
import type { ToastGroupState } from "./machine";
import { SCOPE, toastAnatomy } from "./anatomy";

/** Toast 생성 옵션 */
export type AddToastOptions = Omit<ToastData, "id" | "duration"> & {
  id?: string;
  duration?: number;
};

export interface ToastApi {
  toasts: ToastContext[];
  placement: ToastPlacement;
  count: number;
  addToast(toast: AddToastOptions): void;
  dismissToast(id: string): void;
  removeToast(id: string): void;
  pauseToast(id: string): void;
  resumeToast(id: string): void;
  dismissAll(): void;
  getGroupProps(): Record<string, unknown>;
  getToastProps(toast: ToastContext): Record<string, unknown>;
  getToastTitleProps(toast: ToastContext): Record<string, unknown>;
  getToastDescriptionProps(toast: ToastContext): Record<string, unknown>;
  getToastActionTriggerProps(toast: ToastContext): Record<string, unknown>;
  getToastCloseTriggerProps(toast: ToastContext): Record<string, unknown>;
}

function getRoleForType(type: ToastType): "status" | "alert" {
  return type === "error" ? "alert" : "status";
}

function getLiveRegionForType(type: ToastType): "polite" | "assertive" {
  return type === "error" ? "assertive" : "polite";
}

function getPlacementStyle(placement: ToastPlacement): Record<string, string> {
  const base: Record<string, string> = {
    position: "fixed",
    zIndex: "9999",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    pointerEvents: "none",
  };

  if (placement.startsWith("top")) {
    base.top = "16px";
  } else {
    base.bottom = "16px";
  }

  if (placement.endsWith("start")) {
    base.left = "16px";
    base.alignItems = "flex-start";
  } else if (placement.endsWith("end")) {
    base.right = "16px";
    base.alignItems = "flex-end";
  } else {
    base.left = "50%";
    base.transform = "translateX(-50%)";
    base.alignItems = "center";
  }

  return base;
}

export function connect(
  _state: ToastGroupState,
  ctx: ToastGroupContext,
  send: Send<ToastGroupEvent>,
): ToastApi {
  return {
    toasts: ctx.toasts,
    placement: ctx.placement,
    count: ctx.toasts.length,

    addToast(toast) {
      send({ type: "ADD_TOAST", toast });
    },

    dismissToast(id: string) {
      send({ type: "DISMISS_TOAST", id });
    },

    removeToast(id: string) {
      send({ type: "REMOVE_TOAST", id });
    },

    pauseToast(id: string) {
      send({ type: "PAUSE_TOAST", id });
    },

    resumeToast(id: string) {
      send({ type: "RESUME_TOAST", id });
    },

    dismissAll() {
      send({ type: "DISMISS_ALL" });
    },

    getGroupProps() {
      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.group,
        "data-placement": ctx.placement,
        id: ctx.id,
        role: "region",
        "aria-label": "Notifications",
        tabIndex: -1,
        style: getPlacementStyle(ctx.placement),
      };
    },

    getToastProps(toast) {
      const toastState = toast.remaining <= 0 ? "exiting" : "visible";

      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.root,
        "data-state": toastState,
        "data-type": toast.data.type,
        "data-placement": ctx.placement,
        "data-paused": dataAttr(toast.paused),
        id: toast.data.id,
        role: getRoleForType(toast.data.type),
        "aria-live": getLiveRegionForType(toast.data.type),
        "aria-atomic": "true",
        tabIndex: 0,
        style: { pointerEvents: "auto" as const },
        onMouseEnter: composeEventHandlers(() => {
          send({ type: "PAUSE_TOAST", id: toast.data.id });
        }),
        onMouseLeave: composeEventHandlers(() => {
          send({ type: "RESUME_TOAST", id: toast.data.id });
        }),
        onFocus: composeEventHandlers(() => {
          send({ type: "PAUSE_TOAST", id: toast.data.id });
        }),
        onBlur: composeEventHandlers(() => {
          send({ type: "RESUME_TOAST", id: toast.data.id });
        }),
      };
    },

    getToastTitleProps(toast) {
      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.title,
        "data-type": toast.data.type,
        id: `${toast.data.id}:title`,
      };
    },

    getToastDescriptionProps(toast) {
      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.description,
        "data-type": toast.data.type,
        id: `${toast.data.id}:description`,
      };
    },

    getToastActionTriggerProps(toast) {
      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.actionTrigger,
        "data-type": toast.data.type,
        type: "button" as const,
        "aria-label": toast.data.actionLabel ?? "Action",
        onClick: composeEventHandlers(() => {
          toast.data.onAction?.();
          send({ type: "DISMISS_TOAST", id: toast.data.id });
        }),
      };
    },

    getToastCloseTriggerProps(toast) {
      return {
        "data-scope": SCOPE,
        "data-part": toastAnatomy.closeTrigger,
        "data-type": toast.data.type,
        type: "button" as const,
        "aria-label": "Close notification",
        onClick: composeEventHandlers(() => {
          send({ type: "DISMISS_TOAST", id: toast.data.id });
        }),
      };
    },
  };
}
