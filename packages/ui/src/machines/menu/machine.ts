/**
 * Menu 상태머신
 * WAI-ARIA Menu + MenuButton 패턴의 열기/닫기 및 아이템 하이라이트를 관리한다.
 *
 * States:
 *   closed ─OPEN/TOGGLE──→ open
 *   closed ─OPEN_AND_HIGHLIGHT_FIRST──→ open (첫 번째 아이템 하이라이트)
 *   closed ─OPEN_AND_HIGHLIGHT_LAST──→ open (마지막 아이템 하이라이트)
 *   open ─CLOSE/TOGGLE──→ closed
 *   open ─HIGHLIGHT_NEXT/PREV──→ open (아이템 이동)
 *   open ─SELECT_HIGHLIGHTED──→ closed (아이템 선택)
 */

import type { MachineDefinition, TransitionResult } from "@/machines/shared/types";
import type { MenuState, MenuContext, MenuEvent } from "./types";

function getEnabledIds(context: MenuContext): string[] {
  return context.itemIds.filter((id) => !context.disabledIds.has(id));
}

function getNextEnabledId(context: MenuContext, direction: 1 | -1): string | null {
  const enabledIds = getEnabledIds(context);
  if (enabledIds.length === 0) return null;

  const currentIndex = context.highlightedId ? enabledIds.indexOf(context.highlightedId) : -1;

  if (currentIndex === -1) {
    return direction === 1 ? enabledIds[0]! : enabledIds[enabledIds.length - 1]!;
  }

  let nextIndex = currentIndex + direction;
  if (nextIndex < 0) nextIndex = enabledIds.length - 1;
  if (nextIndex >= enabledIds.length) nextIndex = 0;

  return enabledIds[nextIndex]!;
}

function getFirstEnabledId(context: MenuContext): string | null {
  const enabledIds = getEnabledIds(context);
  return enabledIds[0] ?? null;
}

function getLastEnabledId(context: MenuContext): string | null {
  const enabledIds = getEnabledIds(context);
  return enabledIds[enabledIds.length - 1] ?? null;
}

function findByTypeahead(context: MenuContext, search: string): string | null {
  const enabledIds = getEnabledIds(context);
  const lowerSearch = search.toLowerCase();

  for (const id of enabledIds) {
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    const text = el?.textContent?.trim().toLowerCase() ?? "";
    if (text.startsWith(lowerSearch)) {
      return id;
    }
  }
  return null;
}

export function createMenuMachine(options: {
  id: string;
  open?: boolean;
  orientation?: "horizontal" | "vertical";
}): MachineDefinition<MenuState, MenuContext, MenuEvent> {
  const { id, open = false, orientation = "vertical" } = options;

  return {
    initialState: open ? "open" : "closed",
    initialContext: {
      id,
      highlightedId: null,
      orientation,
      disabledIds: new Set(),
      itemIds: [],
      typeahead: "",
    },
    transition(
      state: MenuState,
      context: MenuContext,
      event: MenuEvent,
    ): TransitionResult<MenuState, MenuContext> {
      // 아이템 등록/해제는 어떤 상태에서든 가능
      if (event.type === "REGISTER_ITEM") {
        const alreadyRegistered = context.itemIds.includes(event.id);
        const alreadyDisabled = context.disabledIds.has(event.id);

        // 이미 등록되어 있고 disabled 상태도 동일하면 변경 없음
        if (alreadyRegistered && (event.disabled ? alreadyDisabled : !alreadyDisabled)) {
          return { state, context };
        }

        const newItemIds = alreadyRegistered ? context.itemIds : [...context.itemIds, event.id];
        const newDisabledIds = new Set(context.disabledIds);
        if (event.disabled) {
          newDisabledIds.add(event.id);
        } else {
          newDisabledIds.delete(event.id);
        }
        return {
          state,
          context: { ...context, itemIds: newItemIds, disabledIds: newDisabledIds },
        };
      }

      if (event.type === "UNREGISTER_ITEM") {
        const newItemIds = context.itemIds.filter((id) => id !== event.id);
        const newDisabledIds = new Set(context.disabledIds);
        newDisabledIds.delete(event.id);
        return {
          state,
          context: {
            ...context,
            itemIds: newItemIds,
            disabledIds: newDisabledIds,
            highlightedId: context.highlightedId === event.id ? null : context.highlightedId,
          },
        };
      }

      switch (state) {
        case "closed": {
          if (event.type === "OPEN" || event.type === "TOGGLE") {
            return {
              state: "open",
              context: { ...context, highlightedId: null, typeahead: "" },
            };
          }
          if (event.type === "OPEN_AND_HIGHLIGHT_FIRST") {
            const firstId = getFirstEnabledId(context);
            return {
              state: "open",
              context: { ...context, highlightedId: firstId, typeahead: "" },
              effects: firstId ? [{ type: "scrollIntoView", target: firstId }] : [],
            };
          }
          if (event.type === "OPEN_AND_HIGHLIGHT_LAST") {
            const lastId = getLastEnabledId(context);
            return {
              state: "open",
              context: { ...context, highlightedId: lastId, typeahead: "" },
              effects: lastId ? [{ type: "scrollIntoView", target: lastId }] : [],
            };
          }
          return { state, context };
        }

        case "open": {
          if (event.type === "CLOSE" || event.type === "TOGGLE") {
            return {
              state: "closed",
              context: { ...context, highlightedId: null, typeahead: "" },
            };
          }

          if (event.type === "HIGHLIGHT") {
            return {
              state,
              context: { ...context, highlightedId: event.id },
              effects: event.id ? [{ type: "scrollIntoView", target: event.id }] : [],
            };
          }

          if (event.type === "HIGHLIGHT_NEXT") {
            const nextId = getNextEnabledId(context, 1);
            return {
              state,
              context: { ...context, highlightedId: nextId },
              effects: nextId ? [{ type: "scrollIntoView", target: nextId }] : [],
            };
          }

          if (event.type === "HIGHLIGHT_PREV") {
            const prevId = getNextEnabledId(context, -1);
            return {
              state,
              context: { ...context, highlightedId: prevId },
              effects: prevId ? [{ type: "scrollIntoView", target: prevId }] : [],
            };
          }

          if (event.type === "HIGHLIGHT_FIRST") {
            const firstId = getFirstEnabledId(context);
            return {
              state,
              context: { ...context, highlightedId: firstId },
              effects: firstId ? [{ type: "scrollIntoView", target: firstId }] : [],
            };
          }

          if (event.type === "HIGHLIGHT_LAST") {
            const lastId = getLastEnabledId(context);
            return {
              state,
              context: { ...context, highlightedId: lastId },
              effects: lastId ? [{ type: "scrollIntoView", target: lastId }] : [],
            };
          }

          if (event.type === "SELECT_HIGHLIGHTED") {
            return {
              state: "closed",
              context: { ...context, highlightedId: null, typeahead: "" },
            };
          }

          if (event.type === "TYPEAHEAD") {
            const newSearch = context.typeahead + event.key;
            const matchId = findByTypeahead(context, newSearch);
            return {
              state,
              context: {
                ...context,
                typeahead: newSearch,
                highlightedId: matchId ?? context.highlightedId,
              },
              effects: matchId ? [{ type: "scrollIntoView", target: matchId }] : [],
            };
          }

          if (event.type === "OPEN_AND_HIGHLIGHT_FIRST") {
            const firstId = getFirstEnabledId(context);
            return {
              state,
              context: { ...context, highlightedId: firstId },
              effects: firstId ? [{ type: "scrollIntoView", target: firstId }] : [],
            };
          }

          if (event.type === "OPEN_AND_HIGHLIGHT_LAST") {
            const lastId = getLastEnabledId(context);
            return {
              state,
              context: { ...context, highlightedId: lastId },
              effects: lastId ? [{ type: "scrollIntoView", target: lastId }] : [],
            };
          }

          return { state, context };
        }

        default:
          return { state, context };
      }
    },
  };
}
