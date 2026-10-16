/**
 * Splitter 상태머신
 * 순수 함수 — React 의존성 없음
 */

import { Keys, isKey } from "@/machines/shared";
import type { TransitionResult } from "@/machines/shared";
import type { SplitterState, SplitterContext, SplitterEvent, PanelConstraint } from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function defaultConstraint(): PanelConstraint {
  return { min: 0, max: 100, collapsedSize: 0, collapsible: false };
}

function getConstraint(ctx: SplitterContext, index: number): PanelConstraint {
  return ctx.panels[index] ?? defaultConstraint();
}

/**
 * 핸들 index를 기준으로 좌(위) 패널 index = handleIndex, 우(아래) 패널 index = handleIndex + 1
 * delta가 양수면 좌측 패널 커지고 우측 줄어듦
 */
function resizePanels(ctx: SplitterContext, handleIndex: number, delta: number): number[] {
  const sizes = [...ctx.sizes];
  const leftIdx = handleIndex;
  const rightIdx = handleIndex + 1;
  const leftConstraint = getConstraint(ctx, leftIdx);
  const rightConstraint = getConstraint(ctx, rightIdx);

  const leftSize = sizes[leftIdx]!;
  const rightSize = sizes[rightIdx]!;

  const newLeft = clamp(leftSize + delta, leftConstraint.min, leftConstraint.max);
  const actualDelta = newLeft - leftSize;
  const newRight = clamp(rightSize - actualDelta, rightConstraint.min, rightConstraint.max);
  const finalDelta = rightSize - newRight;
  const finalLeft = clamp(leftSize + finalDelta, leftConstraint.min, leftConstraint.max);

  sizes[leftIdx] = finalLeft;
  sizes[rightIdx] = newRight;

  return sizes;
}

function toggleCollapse(ctx: SplitterContext, handleIndex: number): number[] {
  const sizes = [...ctx.sizes];
  const leftIdx = handleIndex;
  const leftConstraint = getConstraint(ctx, leftIdx);
  const rightIdx = handleIndex + 1;
  const rightConstraint = getConstraint(ctx, rightIdx);

  // Try collapsing left panel first
  if (leftConstraint.collapsible) {
    const leftSize = sizes[leftIdx]!;
    if (leftSize > leftConstraint.collapsedSize) {
      const diff = leftSize - leftConstraint.collapsedSize;
      sizes[leftIdx] = leftConstraint.collapsedSize;
      sizes[rightIdx] = clamp(sizes[rightIdx]! + diff, rightConstraint.min, rightConstraint.max);
      return sizes;
    }
    // Already collapsed, restore to min
    const restoreSize = leftConstraint.min > 0 ? leftConstraint.min : 50;
    const target = Math.min(restoreSize, sizes[rightIdx]! + leftSize);
    const diff = target - leftSize;
    sizes[leftIdx] = target;
    sizes[rightIdx] = clamp(sizes[rightIdx]! - diff, rightConstraint.min, rightConstraint.max);
    return sizes;
  }

  // Try collapsing right panel
  if (rightConstraint.collapsible) {
    const rightSize = sizes[rightIdx]!;
    if (rightSize > rightConstraint.collapsedSize) {
      const diff = rightSize - rightConstraint.collapsedSize;
      sizes[rightIdx] = rightConstraint.collapsedSize;
      sizes[leftIdx] = clamp(sizes[leftIdx]! + diff, leftConstraint.min, leftConstraint.max);
      return sizes;
    }
    const restoreSize = rightConstraint.min > 0 ? rightConstraint.min : 50;
    const target = Math.min(restoreSize, sizes[leftIdx]! + rightSize);
    const diff = target - rightSize;
    sizes[rightIdx] = target;
    sizes[leftIdx] = clamp(sizes[leftIdx]! - diff, leftConstraint.min, leftConstraint.max);
    return sizes;
  }

  return sizes;
}

function getHandleId(ctx: SplitterContext, index: number): string {
  return `${ctx.id}:handle:${index}`;
}

export function transition(
  state: SplitterState,
  ctx: SplitterContext,
  event: SplitterEvent,
): TransitionResult<SplitterState, SplitterContext> {
  if (ctx.disabled) {
    if (event.type === "SET_SIZES") {
      return { state, context: { ...ctx, sizes: event.sizes } };
    }
    if (event.type === "SET_CONTEXT") {
      return { state, context: { ...ctx, ...event.context } };
    }
    return { state, context: ctx };
  }

  switch (event.type) {
    case "HANDLE_POINTER_DOWN": {
      return {
        state: "dragging",
        context: { ...ctx, activeHandleIndex: event.index },
        effects: [{ type: "focus", target: getHandleId(ctx, event.index) }],
      };
    }

    case "POINTER_MOVE": {
      if (state !== "dragging" || ctx.activeHandleIndex < 0) return { state, context: ctx };
      const newSizes = resizePanels(ctx, ctx.activeHandleIndex, event.delta);
      return { state: "dragging", context: { ...ctx, sizes: newSizes } };
    }

    case "POINTER_UP": {
      if (state !== "dragging") return { state, context: ctx };
      return { state: "idle", context: { ...ctx, activeHandleIndex: -1 } };
    }

    case "HANDLE_KEY_DOWN": {
      const { index, key } = event;
      const isHorizontal = ctx.orientation === "horizontal";

      // Enter: toggle collapse
      if (isKey(key, Keys.Enter)) {
        const newSizes = toggleCollapse(ctx, index);
        return { state, context: { ...ctx, sizes: newSizes } };
      }

      let delta = 0;

      if (isHorizontal) {
        if (isKey(key, Keys.ArrowRight)) delta = ctx.step;
        else if (isKey(key, Keys.ArrowLeft)) delta = -ctx.step;
      } else {
        if (isKey(key, Keys.ArrowDown)) delta = ctx.step;
        else if (isKey(key, Keys.ArrowUp)) delta = -ctx.step;
      }

      if (isKey(key, Keys.Home)) {
        const leftConstraint = getConstraint(ctx, index);
        delta = leftConstraint.min - ctx.sizes[index]!;
      }
      if (isKey(key, Keys.End)) {
        const leftConstraint = getConstraint(ctx, index);
        delta = leftConstraint.max - ctx.sizes[index]!;
      }

      if (delta !== 0) {
        const newSizes = resizePanels(ctx, index, delta);
        return { state, context: { ...ctx, sizes: newSizes } };
      }

      return { state, context: ctx };
    }

    case "HANDLE_DOUBLE_CLICK": {
      const newSizes = toggleCollapse(ctx, event.index);
      return { state, context: { ...ctx, sizes: newSizes } };
    }

    case "SET_SIZES": {
      return { state, context: { ...ctx, sizes: event.sizes } };
    }

    case "SET_CONTEXT": {
      return { state, context: { ...ctx, ...event.context } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createSplitterMachine(ctx: Partial<SplitterContext> & { id: string }) {
  const panelCount = ctx.sizes?.length ?? 2;
  const defaultPanels: PanelConstraint[] = Array.from({ length: panelCount }, () =>
    defaultConstraint(),
  );

  const initialContext: SplitterContext = {
    sizes: ctx.sizes ?? [50, 50],
    orientation: ctx.orientation ?? "horizontal",
    disabled: ctx.disabled ?? false,
    panels: ctx.panels ?? defaultPanels,
    activeHandleIndex: -1,
    step: ctx.step ?? 1,
    id: ctx.id,
  };

  return {
    initialState: "idle" as SplitterState,
    initialContext,
    transition,
  };
}
