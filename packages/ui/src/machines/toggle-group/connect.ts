/**
 * ToggleGroup connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr, composeEventHandlers } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { ToggleGroupState, ToggleGroupContext, ToggleGroupEvent } from "./types";
import { SCOPE, toggleGroupAnatomy } from "./anatomy";

export interface ToggleGroupApi {
  value: string[];
  setValue(value: string[]): void;
  getRootProps(): Record<string, unknown>;
  getItemProps(props: { value: string; disabled?: boolean }): Record<string, unknown>;
}

export function connect(
  _state: ToggleGroupState,
  ctx: ToggleGroupContext,
  send: Send<ToggleGroupEvent>,
): ToggleGroupApi {
  function getItemId(value: string): string {
    return `${ctx.id}:item:${value}`;
  }

  function isItemActive(value: string): boolean {
    return ctx.value.includes(value);
  }

  function isItemDisabled(itemDisabled?: boolean): boolean {
    return ctx.disabled || !!itemDisabled;
  }

  function getTabIndex(value: string, itemDisabled?: boolean): number {
    if (isItemDisabled(itemDisabled)) return -1;

    // 포커스된 아이템이 있으면 해당 아이템만 tabindex=0
    if (ctx.focusedIndex >= 0 && ctx.items[ctx.focusedIndex] === value) return 0;

    // 활성 아이템 중 첫 번째
    const firstActive = ctx.value.find(
      (v) => ctx.items.includes(v) && !ctx.disabledItems.includes(v),
    );
    if (firstActive) return value === firstActive ? 0 : -1;

    // 아무것도 활성이 아니면 첫 번째 enabled 아이템
    const firstEnabled = ctx.items.find((v) => !ctx.disabledItems.includes(v));
    return value === firstEnabled ? 0 : -1;
  }

  return {
    value: ctx.value,

    setValue(value: string[]) {
      send({ type: "SET_VALUE", value });
    },

    getRootProps() {
      return {
        "data-scope": SCOPE,
        "data-part": toggleGroupAnatomy.root,
        "data-orientation": ctx.orientation,
        "data-disabled": dataAttr(ctx.disabled),
        role: "group",
      };
    },

    getItemProps(props) {
      const { value, disabled: itemDisabled } = props;
      const active = isItemActive(value);
      const disabled = isItemDisabled(itemDisabled);
      const globalIndex = ctx.items.indexOf(value);

      return {
        id: getItemId(value),
        type: "button" as const,
        "data-scope": SCOPE,
        "data-part": toggleGroupAnatomy.item,
        "data-state": active ? "on" : "off",
        "data-disabled": dataAttr(disabled),
        "data-orientation": ctx.orientation,
        "aria-pressed": active,
        disabled,
        tabIndex: getTabIndex(value, itemDisabled),
        onFocus: composeEventHandlers(() => {
          if (!disabled) {
            send({ type: "ITEM_FOCUS", index: globalIndex });
          }
        }),
        onClick: composeEventHandlers(() => {
          if (!disabled) {
            send({ type: "ITEM_TOGGLE", value });
          }
        }),
        onKeyDown: composeEventHandlers((e: KeyboardEvent) => {
          if (disabled) return;
          const handled = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
            " ",
            "Enter",
          ];
          if (handled.includes(e.key)) {
            e.preventDefault();
            send({ type: "KEY_DOWN", key: e.key });
          }
        }),
      };
    },
  };
}
