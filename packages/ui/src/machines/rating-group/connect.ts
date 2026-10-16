/**
 * RatingGroup connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, ariaAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { RatingGroupState, RatingGroupContext, RatingGroupEvent } from "./types";
import { SCOPE, ratingGroupAnatomy } from "./anatomy";

export interface RatingGroupApi {
  value: number;
  hoveredValue: number;
  isHovering: boolean;
  setValue(value: number): void;
  getRootProps(): Record<string, unknown>;
  getLabelProps(): Record<string, unknown>;
  getControlProps(): Record<string, unknown>;
  getItemProps(props: { index: number }): Record<string, unknown>;
  getHiddenInputProps(): Record<string, unknown>;
}

export function connect(
  state: RatingGroupState,
  ctx: RatingGroupContext,
  send: Send<RatingGroupEvent>,
): RatingGroupApi {
  const isHovering = state === "hovering";
  /** 표시에 사용할 값: hover 중이면 hoveredValue, 아니면 value */
  const displayValue = isHovering && ctx.hoveredValue >= 0 ? ctx.hoveredValue : ctx.value;

  function getLabelId(): string {
    return `${ctx.id}:label`;
  }

  function getControlId(): string {
    return `${ctx.id}:control`;
  }

  function getItemId(index: number): string {
    return `${ctx.id}:item:${index}`;
  }

  return {
    value: ctx.value,
    hoveredValue: ctx.hoveredValue,
    isHovering,

    setValue(value: number) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": ratingGroupAnatomy.root,
        "data-disabled": dataAttr(ctx.disabled),
        "data-readonly": dataAttr(ctx.readOnly),
        id: ctx.id,
      };
    },

    getLabelProps() {
      return {
        id: getLabelId(),
        "data-scope": SCOPE,
        "data-part": ratingGroupAnatomy.label,
        "data-disabled": dataAttr(ctx.disabled),
        htmlFor: getControlId(),
      };
    },

    getControlProps() {
      return {
        id: getControlId(),
        "data-scope": SCOPE,
        "data-part": ratingGroupAnatomy.control,
        "data-disabled": dataAttr(ctx.disabled),
        role: "radiogroup",
        "aria-orientation": "horizontal" as const,
        "aria-labelledby": getLabelId(),
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        "aria-readonly": ctx.readOnly ? ariaAttr(true) : undefined,
        "aria-required": ctx.required ? ariaAttr(true) : undefined,
        onMouseLeave: composeEventHandlers(() => {
          send({ type: "HOVER_END" });
        }),
      };
    },

    getItemProps(props) {
      const { index } = props;
      const itemValue = index + 1;
      const isHighlighted = itemValue <= displayValue;
      const isHalf = ctx.allowHalf && displayValue === index + 0.5;
      const isChecked = ctx.value === itemValue;

      function getItemState(): string {
        if (isHalf) return "half";
        if (isHighlighted) return "checked";
        return "unchecked";
      }

      return {
        id: getItemId(index),
        "data-scope": SCOPE,
        "data-part": ratingGroupAnatomy.item,
        "data-state": getItemState(),
        "data-disabled": dataAttr(ctx.disabled),
        "data-highlighted": dataAttr(isHighlighted || isHalf),
        "data-half": dataAttr(isHalf),
        "data-value": itemValue,
        role: "radio",
        "aria-checked": ariaAttr(isChecked),
        "aria-label": `${itemValue} star${itemValue > 1 ? "s" : ""}`,
        "aria-disabled": ctx.disabled ? ariaAttr(true) : undefined,
        tabIndex: ctx.disabled ? -1 : ctx.value > 0 ? (isChecked ? 0 : -1) : index === 0 ? 0 : -1,
        onClick: composeEventHandlers(() => {
          if (!ctx.disabled && !ctx.readOnly) {
            send({ type: "SET_VALUE", value: itemValue });
          }
        }),
        onMouseMove: composeEventHandlers((e: MouseEvent) => {
          if (ctx.disabled || ctx.readOnly) return;
          if (ctx.allowHalf) {
            const target = e.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            send({ type: "HOVER", value: isLeftHalf ? index + 0.5 : itemValue });
          } else {
            send({ type: "HOVER", value: itemValue });
          }
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (ctx.disabled) return;
          const handled = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "KEY_DOWN", key: e.key });
          }
        }),
      };
    },

    getHiddenInputProps() {
      return {
        "data-scope": SCOPE,
        "data-part": ratingGroupAnatomy.hiddenInput,
        type: "hidden" as const,
        name: ctx.name,
        value: ctx.value,
        disabled: ctx.disabled,
        readOnly: ctx.readOnly,
        required: ctx.required,
        "aria-hidden": "true" as const,
      };
    },
  };
}
