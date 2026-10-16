/**
 * Tour connect — 머신 상태를 DOM 속성으로 변환
 */

import { composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { TourState, TourContext, TourEvent, TourStep } from "./types";
import { SCOPE, tourAnatomy } from "./anatomy";

export type TourAction = "next" | "prev";

export interface TourApi {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | undefined;
  isFirstStep: boolean;
  isLastStep: boolean;
  progressText: string;
  open(): void;
  close(): void;
  next(): void;
  prev(): void;
  goTo(step: number): void;
  getBackdropProps(): Record<string, unknown>;
  getPositionerProps(): Record<string, unknown>;
  getContentProps(): Record<string, unknown>;
  getTitleProps(): Record<string, unknown>;
  getDescriptionProps(): Record<string, unknown>;
  getProgressTextProps(): Record<string, unknown>;
  getCloseTriggerProps(): Record<string, unknown>;
  getActionTriggerProps(props: { action: TourAction }): Record<string, unknown>;
  getArrowProps(): Record<string, unknown>;
  getSpotlightProps(): Record<string, unknown>;
}

function getTargetRect(selector: string): DOMRect | null {
  if (typeof document === "undefined") return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export function connect(state: TourState, ctx: TourContext, send: Send<TourEvent>): TourApi {
  const isOpen = state === "open";
  const step = ctx.steps[ctx.currentStep];
  const isFirstStep = ctx.currentStep === 0;
  const isLastStep = ctx.currentStep === ctx.steps.length - 1;
  const progressText = `${ctx.currentStep + 1} of ${ctx.steps.length}`;

  function getContentId(): string {
    return `${ctx.id}:content`;
  }

  function getTitleId(): string {
    return `${ctx.id}:title`;
  }

  function getDescriptionId(): string {
    return `${ctx.id}:description`;
  }

  return {
    isOpen,
    currentStep: ctx.currentStep,
    totalSteps: ctx.steps.length,
    step,
    isFirstStep,
    isLastStep,
    progressText,

    open() {
      send({ type: "OPEN" });
    },
    close() {
      send({ type: "CLOSE" });
    },
    next() {
      send({ type: "NEXT" });
    },
    prev() {
      send({ type: "PREV" });
    },
    goTo(stepIndex: number) {
      send({ type: "GO_TO", step: stepIndex });
    },

    getBackdropProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.backdrop,
        "data-state": isOpen ? "open" : "closed",
        hidden: !isOpen,
        style: {
          position: "fixed" as const,
          inset: 0,
        },
      };
    },

    getPositionerProps() {
      const rect = step ? getTargetRect(step.target) : null;

      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.positioner,
        "data-state": isOpen ? "open" : "closed",
        "data-step": ctx.currentStep,
        hidden: !isOpen,
        style: {
          position: "fixed" as const,
          ...(rect
            ? {
                top: `${rect.bottom + 8}px`,
                left: `${rect.left}px`,
              }
            : {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }),
        },
      };
    },

    getContentProps() {
      return {
        id: getContentId(),
        "data-scope": SCOPE,
        "data-part": tourAnatomy.content,
        "data-state": isOpen ? "open" : "closed",
        "data-step": ctx.currentStep,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": getTitleId(),
        "aria-describedby": getDescriptionId(),
        tabIndex: -1,
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (e.key === "Escape") {
            e.preventDefault();
            send({ type: "CLOSE" });
          }
        }),
      };
    },

    getTitleProps() {
      return {
        id: getTitleId(),
        "data-scope": SCOPE,
        "data-part": tourAnatomy.title,
      };
    },

    getDescriptionProps() {
      return {
        id: getDescriptionId(),
        "data-scope": SCOPE,
        "data-part": tourAnatomy.description,
      };
    },

    getProgressTextProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.progressText,
        "aria-live": "polite",
      };
    },

    getCloseTriggerProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.closeTrigger,
        "aria-label": "Close tour",
        onClick: () => send({ type: "CLOSE" }),
      };
    },

    getActionTriggerProps(props) {
      const { action } = props;

      const actionMap: Record<TourAction, () => void> = {
        next: () => send({ type: "NEXT" }),
        prev: () => send({ type: "PREV" }),
      };

      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.actionTrigger,
        "data-action": action,
        disabled: action === "prev" && isFirstStep,
        onClick: actionMap[action],
      };
    },

    getArrowProps() {
      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.arrow,
      };
    },

    getSpotlightProps() {
      const rect = step ? getTargetRect(step.target) : null;

      return {
        "data-scope": SCOPE,
        "data-part": tourAnatomy.spotlight,
        "data-state": isOpen ? "open" : "closed",
        hidden: !isOpen || !rect,
        style: rect
          ? {
              position: "fixed" as const,
              top: `${rect.top}px`,
              left: `${rect.left}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
              pointerEvents: "none" as const,
            }
          : {
              position: "fixed" as const,
              pointerEvents: "none" as const,
            },
      };
    },
  };
}
