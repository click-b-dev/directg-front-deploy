/**
 * TreeView 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult, Effect } from "@/machines/shared";
import type { TreeViewState, TreeViewContext, TreeViewEvent } from "./types";

function getItemDomId(ctx: TreeViewContext, itemId: string): string {
  return `${ctx.id}:item:${itemId}`;
}

function getVisibleIds(ctx: TreeViewContext): string[] {
  return ctx.visibleIds;
}

function getNextVisibleId(ctx: TreeViewContext, currentId: string): string {
  const visible = getVisibleIds(ctx);
  const idx = visible.indexOf(currentId);
  if (idx < 0 || idx >= visible.length - 1) return currentId;
  return visible[idx + 1]!;
}

function getPrevVisibleId(ctx: TreeViewContext, currentId: string): string {
  const visible = getVisibleIds(ctx);
  const idx = visible.indexOf(currentId);
  if (idx <= 0) return currentId;
  return visible[idx - 1]!;
}

function getFirstVisibleId(ctx: TreeViewContext): string {
  const visible = getVisibleIds(ctx);
  return visible[0] ?? "";
}

function getLastVisibleId(ctx: TreeViewContext): string {
  const visible = getVisibleIds(ctx);
  return visible[visible.length - 1] ?? "";
}

function isBranch(ctx: TreeViewContext, id: string): boolean {
  return ctx.branchIds.includes(id);
}

function isExpanded(ctx: TreeViewContext, id: string): boolean {
  return ctx.expandedIds.includes(id);
}

function getParentId(ctx: TreeViewContext, id: string): string | undefined {
  return ctx.parentMap[id];
}

function getChildIds(ctx: TreeViewContext, id: string): string[] {
  return ctx.childrenMap[id] ?? [];
}

function getSiblingBranchIds(ctx: TreeViewContext, id: string): string[] {
  const parentId = getParentId(ctx, id);
  const siblings = parentId ? getChildIds(ctx, parentId) : (ctx.childrenMap["__root__"] ?? []);
  return siblings.filter((sid) => isBranch(ctx, sid));
}

function toggleExpanded(ctx: TreeViewContext, id: string): string[] {
  if (isExpanded(ctx, id)) {
    return ctx.expandedIds.filter((eid) => eid !== id);
  }
  return [...ctx.expandedIds, id];
}

function toggleSelected(ctx: TreeViewContext, id: string): string[] {
  if (ctx.selectionMode === "single") {
    return ctx.selectedIds.includes(id) ? [] : [id];
  }
  if (ctx.selectedIds.includes(id)) {
    return ctx.selectedIds.filter((sid) => sid !== id);
  }
  return [...ctx.selectedIds, id];
}

function computeVisibleIds(ctx: TreeViewContext): string[] {
  const result: string[] = [];

  function walk(ids: string[]) {
    for (const id of ids) {
      result.push(id);
      if (isBranch(ctx, id) && isExpanded(ctx, id)) {
        walk(getChildIds(ctx, id));
      }
    }
  }

  const rootChildren = ctx.childrenMap["__root__"] ?? [];
  walk(rootChildren);
  return result;
}

function focusEffects(ctx: TreeViewContext, id: string): Effect[] {
  return [{ type: "focus", target: getItemDomId(ctx, id) }];
}

export function transition(
  state: TreeViewState,
  ctx: TreeViewContext,
  event: TreeViewEvent,
): TransitionResult<TreeViewState, TreeViewContext> {
  // Global events
  switch (event.type) {
    case "SET_EXPANDED": {
      const same =
        ctx.expandedIds.length === event.ids.length &&
        ctx.expandedIds.every((v, i) => v === event.ids[i]);
      if (same) return { state, context: ctx };
      const newCtx = { ...ctx, expandedIds: event.ids };
      return {
        state,
        context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
      };
    }
    case "SET_SELECTED": {
      const same =
        ctx.selectedIds.length === event.ids.length &&
        ctx.selectedIds.every((v, i) => v === event.ids[i]);
      if (same) return { state, context: ctx };
      return { state, context: { ...ctx, selectedIds: event.ids } };
    }
    case "SET_VISIBLE_IDS":
      return { state, context: { ...ctx, visibleIds: event.ids } };
    case "REGISTER_TREE": {
      const newCtx = {
        ...ctx,
        childrenMap: event.childrenMap,
        parentMap: event.parentMap,
        branchIds: event.branchIds,
        visibleIds: event.visibleIds,
      };
      return { state, context: newCtx };
    }
    default:
      break;
  }

  switch (state) {
    case "idle":
      return idleTransition(ctx, event);
    case "focused":
      return focusedTransition(ctx, event);
    default:
      return { state, context: ctx };
  }
}

function idleTransition(
  ctx: TreeViewContext,
  event: TreeViewEvent,
): TransitionResult<TreeViewState, TreeViewContext> {
  switch (event.type) {
    case "FOCUS_IN": {
      const focusedId = ctx.focusedId || getFirstVisibleId(ctx);
      return {
        state: "focused",
        context: { ...ctx, focusedId },
        effects: focusEffects(ctx, focusedId),
      };
    }
    case "ITEM_CLICK": {
      const newSelected = toggleSelected(ctx, event.id);
      if (isBranch(ctx, event.id)) {
        const newExpanded = toggleExpanded(ctx, event.id);
        const newCtx = {
          ...ctx,
          expandedIds: newExpanded,
          selectedIds: newSelected,
          focusedId: event.id,
        };
        return {
          state: "focused",
          context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
          effects: focusEffects(ctx, event.id),
        };
      }
      return {
        state: "focused",
        context: { ...ctx, selectedIds: newSelected, focusedId: event.id },
        effects: focusEffects(ctx, event.id),
      };
    }
    default:
      return { state: "idle", context: ctx };
  }
}

function focusedTransition(
  ctx: TreeViewContext,
  event: TreeViewEvent,
): TransitionResult<TreeViewState, TreeViewContext> {
  switch (event.type) {
    case "FOCUS_OUT":
      return { state: "idle", context: ctx };

    case "ITEM_FOCUS":
      return { state: "focused", context: { ...ctx, focusedId: event.id } };

    case "ITEM_CLICK": {
      const newSelected = toggleSelected(ctx, event.id);
      if (isBranch(ctx, event.id)) {
        const newExpanded = toggleExpanded(ctx, event.id);
        const newCtx = {
          ...ctx,
          expandedIds: newExpanded,
          selectedIds: newSelected,
          focusedId: event.id,
        };
        return {
          state: "focused",
          context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
          effects: focusEffects(ctx, event.id),
        };
      }
      return {
        state: "focused",
        context: { ...ctx, selectedIds: newSelected, focusedId: event.id },
        effects: focusEffects(ctx, event.id),
      };
    }

    case "ITEM_SELECT": {
      const newSelected = toggleSelected(ctx, event.id);
      return {
        state: "focused",
        context: { ...ctx, selectedIds: newSelected },
      };
    }

    case "BRANCH_TOGGLE": {
      if (!isBranch(ctx, event.id)) return { state: "focused", context: ctx };
      const newExpanded = toggleExpanded(ctx, event.id);
      const newCtx = { ...ctx, expandedIds: newExpanded };
      return {
        state: "focused",
        context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
      };
    }

    case "EXPAND_SIBLINGS": {
      const siblingBranches = getSiblingBranchIds(ctx, event.id);
      const newExpanded = [...new Set([...ctx.expandedIds, ...siblingBranches])];
      const newCtx = { ...ctx, expandedIds: newExpanded };
      return {
        state: "focused",
        context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
      };
    }

    case "KEY_DOWN": {
      const currentId = ctx.focusedId;

      // Arrow Down: next visible item
      if (isKey(event.key, Keys.ArrowDown)) {
        const nextId = getNextVisibleId(ctx, currentId);
        return {
          state: "focused",
          context: { ...ctx, focusedId: nextId },
          effects: focusEffects(ctx, nextId),
        };
      }

      // Arrow Up: previous visible item
      if (isKey(event.key, Keys.ArrowUp)) {
        const prevId = getPrevVisibleId(ctx, currentId);
        return {
          state: "focused",
          context: { ...ctx, focusedId: prevId },
          effects: focusEffects(ctx, prevId),
        };
      }

      // Arrow Right: expand if branch closed, or move to first child
      if (isKey(event.key, Keys.ArrowRight)) {
        if (isBranch(ctx, currentId)) {
          if (!isExpanded(ctx, currentId)) {
            const newExpanded = [...ctx.expandedIds, currentId];
            const newCtx = { ...ctx, expandedIds: newExpanded };
            return {
              state: "focused",
              context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
            };
          }
          // If expanded, move to first child
          const children = getChildIds(ctx, currentId);
          if (children.length > 0) {
            const firstChild = children[0]!;
            return {
              state: "focused",
              context: { ...ctx, focusedId: firstChild },
              effects: focusEffects(ctx, firstChild),
            };
          }
        }
        return { state: "focused", context: ctx };
      }

      // Arrow Left: collapse if branch open, or move to parent
      if (isKey(event.key, Keys.ArrowLeft)) {
        if (isBranch(ctx, currentId) && isExpanded(ctx, currentId)) {
          const newExpanded = ctx.expandedIds.filter((id) => id !== currentId);
          const newCtx = { ...ctx, expandedIds: newExpanded };
          return {
            state: "focused",
            context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
          };
        }
        // Move to parent
        const parentId = getParentId(ctx, currentId);
        if (parentId && parentId !== "__root__") {
          return {
            state: "focused",
            context: { ...ctx, focusedId: parentId },
            effects: focusEffects(ctx, parentId),
          };
        }
        return { state: "focused", context: ctx };
      }

      // Home: first visible item
      if (isKey(event.key, Keys.Home)) {
        const firstId = getFirstVisibleId(ctx);
        return {
          state: "focused",
          context: { ...ctx, focusedId: firstId },
          effects: focusEffects(ctx, firstId),
        };
      }

      // End: last visible item
      if (isKey(event.key, Keys.End)) {
        const lastId = getLastVisibleId(ctx);
        return {
          state: "focused",
          context: { ...ctx, focusedId: lastId },
          effects: focusEffects(ctx, lastId),
        };
      }

      // Enter/Space: select/activate
      if (isKey(event.key, Keys.Enter, Keys.Space)) {
        const newSelected = toggleSelected(ctx, currentId);
        if (isBranch(ctx, currentId)) {
          const newExpanded = toggleExpanded(ctx, currentId);
          const newCtx = { ...ctx, expandedIds: newExpanded, selectedIds: newSelected };
          return {
            state: "focused",
            context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
          };
        }
        return {
          state: "focused",
          context: { ...ctx, selectedIds: newSelected },
        };
      }

      // * (asterisk): expand all siblings
      if (event.key === "*") {
        const siblingBranches = getSiblingBranchIds(ctx, currentId);
        const newExpanded = [...new Set([...ctx.expandedIds, ...siblingBranches])];
        const newCtx = { ...ctx, expandedIds: newExpanded };
        return {
          state: "focused",
          context: { ...newCtx, visibleIds: computeVisibleIds(newCtx) },
        };
      }

      // Type-ahead: single character match
      if (event.key.length === 1 && event.key !== " " && event.key !== "*") {
        const visible = getVisibleIds(ctx);
        const currentIdx = visible.indexOf(currentId);
        const search = event.key.toLowerCase();

        // Search from current position forward (wrap around)
        for (let i = 1; i <= visible.length; i++) {
          const idx = (currentIdx + i) % visible.length;
          const id = visible[idx]!;
          // Use the DOM element's text content for matching
          const el =
            typeof document !== "undefined" ? document.getElementById(getItemDomId(ctx, id)) : null;
          const text = el?.textContent?.trim().toLowerCase() ?? "";
          if (text.startsWith(search)) {
            return {
              state: "focused",
              context: { ...ctx, focusedId: id },
              effects: focusEffects(ctx, id),
            };
          }
        }
        return { state: "focused", context: ctx };
      }

      return { state: "focused", context: ctx };
    }

    default:
      return { state: "focused", context: ctx };
  }
}

export function createTreeViewMachine(ctx: Partial<TreeViewContext> & { id: string }) {
  const initialContext: TreeViewContext = {
    expandedIds: ctx.expandedIds ?? [],
    selectedIds: ctx.selectedIds ?? [],
    focusedId: ctx.focusedId ?? "",
    selectionMode: ctx.selectionMode ?? "single",
    id: ctx.id,
    visibleIds: ctx.visibleIds ?? [],
    childrenMap: ctx.childrenMap ?? {},
    parentMap: ctx.parentMap ?? {},
    branchIds: ctx.branchIds ?? [],
  };

  return {
    initialState: "idle" as TreeViewState,
    initialContext,
    transition,
  };
}
