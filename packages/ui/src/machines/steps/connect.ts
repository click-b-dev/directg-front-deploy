/**
 * Steps connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { StepsState, StepsContext, StepsEvent } from "./types";
import { SCOPE, stepsAnatomy } from "./anatomy";

function getTriggerId(ctx: StepsContext, step: number): string {
  return `${ctx.id}:trigger:${step}`;
}

function getContentId(ctx: StepsContext, step: number): string {
  return `${ctx.id}:content:${step}`;
}

function getStepStatus(currentStep: number, step: number): "complete" | "current" | "incomplete" {
  if (step < currentStep) return "complete";
  if (step === currentStep) return "current";
  return "incomplete";
}

export function connect(_state: StepsState, ctx: StepsContext, send: Send<StepsEvent>) {
  const { step, count, linear, orientation } = ctx;
  const isFirstStep = step <= 0;
  const isLastStep = step >= count - 1;
  const percent = count > 1 ? (step / (count - 1)) * 100 : 0;

  return {
    /** 현재 스텝 */
    step,

    /** 전체 스텝 수 */
    count,

    /** 첫 스텝 여부 */
    isFirstStep,

    /** 마지막 스텝 여부 */
    isLastStep,

    /** 진행률 (%) */
    percent,

    /** 스텝 설정 */
    setStep(value: number) {
      send({ type: "SET_STEP", step: value });
    },

    /** 다음 스텝 */
    nextStep() {
      send({ type: "NEXT_STEP" });
    },

    /** 이전 스텝 */
    prevStep() {
      send({ type: "PREV_STEP" });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.root,
        "data-orientation": orientation,
      };
    },

    /** List (role="tablist") 속성 */
    getListProps() {
      return {
        role: "tablist" as const,
        "aria-orientation": orientation,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.list,
        "data-orientation": orientation,
      };
    },

    /** Item 속성 */
    getItemProps(props: { index: number }) {
      const status = getStepStatus(step, props.index);
      return {
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.item,
        "data-state": status,
        "data-orientation": orientation,
        "data-index": props.index,
      };
    },

    /** Trigger (role="tab") 속성 */
    getTriggerProps(props: { index: number }) {
      const status = getStepStatus(step, props.index);
      const isCurrent = props.index === step;
      const isCompleted = props.index < step;
      const isDisabled = linear && props.index > step;

      return {
        id: getTriggerId(ctx, props.index),
        role: "tab" as const,
        type: "button" as const,
        tabIndex: isCurrent ? 0 : -1,
        "aria-selected": isCurrent ? "true" : "false",
        "aria-current": isCurrent ? ("step" as const) : undefined,
        "aria-controls": getContentId(ctx, props.index),
        "aria-disabled": isDisabled ? ("true" as const) : undefined,
        disabled: isDisabled,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.trigger,
        "data-state": status,
        "data-complete": dataAttr(isCompleted),
        "data-current": dataAttr(isCurrent),
        "data-disabled": dataAttr(isDisabled),
        "data-orientation": orientation,
        onClick() {
          send({ type: "TRIGGER_CLICK", step: props.index });
        },
      };
    },

    /** Content (role="tabpanel") 속성 */
    getContentProps(props: { index: number }) {
      const isCurrent = props.index === step;
      const status = getStepStatus(step, props.index);

      return {
        id: getContentId(ctx, props.index),
        role: "tabpanel" as const,
        tabIndex: 0,
        "aria-labelledby": getTriggerId(ctx, props.index),
        hidden: !isCurrent,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.content,
        "data-state": status,
        "data-orientation": orientation,
      };
    },

    /** Indicator 속성 */
    getIndicatorProps(props: { index: number }) {
      const status = getStepStatus(step, props.index);
      return {
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.indicator,
        "data-state": status,
      };
    },

    /** Separator 속성 */
    getSeparatorProps(props: { index: number }) {
      const status = getStepStatus(step, props.index);
      return {
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.separator,
        "data-state": status,
        "data-orientation": orientation,
      };
    },

    /** Next Trigger 속성 */
    getNextTriggerProps() {
      return {
        type: "button" as const,
        "aria-label": "Next step",
        disabled: isLastStep,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.nextTrigger,
        "data-disabled": dataAttr(isLastStep),
        onClick() {
          send({ type: "NEXT_STEP" });
        },
      };
    },

    /** Prev Trigger 속성 */
    getPrevTriggerProps() {
      return {
        type: "button" as const,
        "aria-label": "Previous step",
        disabled: isFirstStep,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.prevTrigger,
        "data-disabled": dataAttr(isFirstStep),
        onClick() {
          send({ type: "PREV_STEP" });
        },
      };
    },

    /** Progress 속성 */
    getProgressProps() {
      return {
        role: "progressbar" as const,
        "aria-valuenow": percent,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-label": `Step ${step + 1} of ${count}`,
        "data-scope": SCOPE,
        "data-part": stepsAnatomy.progress,
        "data-orientation": orientation,
      };
    },
  };
}
