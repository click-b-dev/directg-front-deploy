/**
 * Pagination 상태머신
 * 순수 함수 — React 의존성 없음
 */

import type { TransitionResult } from "@/machines/shared";
import type { PaginationState, PaginationContext, PaginationEvent, PageItem } from "./types";

function getTotalPages(ctx: PaginationContext): number {
  return Math.max(1, Math.ceil(ctx.count / ctx.pageSize));
}

function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * 페이지 범위 계산 (ellipsis 포함)
 * 알고리즘:
 * - 항상 첫 페이지와 마지막 페이지를 포함
 * - 현재 페이지 주변으로 siblingCount 만큼의 페이지를 표시
 * - 사이에 빈 공간이 있으면 ellipsis로 채움
 */
export function computePageRange(ctx: PaginationContext): PageItem[] {
  const totalPages = getTotalPages(ctx);
  const { page, siblingCount } = ctx;

  if (totalPages <= 1) {
    return [{ type: "page", value: 1 }];
  }

  // 전체 페이지 수가 충분히 적으면 모두 표시
  // 양쪽 sibling + 현재 + 첫/마지막 + 2 ellipsis = 2*siblingCount + 5
  const totalSlots = 2 * siblingCount + 5;
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, i) => ({
      type: "page" as const,
      value: i + 1,
    }));
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1);
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const items: PageItem[] = [];

  // 첫 페이지
  items.push({ type: "page", value: 1 });

  // 왼쪽 ellipsis 또는 2번 페이지
  if (showLeftEllipsis) {
    items.push({ type: "ellipsis", position: "start" });
  } else {
    // 2번 페이지도 표시
    if (leftSiblingIndex > 1) {
      for (let i = 2; i < leftSiblingIndex; i++) {
        items.push({ type: "page", value: i });
      }
    }
  }

  // sibling 범위 내 페이지들
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== 1 && i !== totalPages) {
      items.push({ type: "page", value: i });
    }
  }

  // 오른쪽 ellipsis 또는 마지막-1 페이지
  if (showRightEllipsis) {
    items.push({ type: "ellipsis", position: "end" });
  } else {
    for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
      items.push({ type: "page", value: i });
    }
  }

  // 마지막 페이지
  items.push({ type: "page", value: totalPages });

  return items;
}

export function transition(
  state: PaginationState,
  ctx: PaginationContext,
  event: PaginationEvent,
): TransitionResult<PaginationState, PaginationContext> {
  const totalPages = getTotalPages(ctx);

  switch (event.type) {
    case "SET_PAGE": {
      const newPage = clampPage(event.page, totalPages);
      if (newPage === ctx.page) return { state, context: ctx };
      return { state, context: { ...ctx, page: newPage } };
    }

    case "NEXT_PAGE": {
      const newPage = clampPage(ctx.page + 1, totalPages);
      return { state, context: { ...ctx, page: newPage } };
    }

    case "PREV_PAGE": {
      const newPage = clampPage(ctx.page - 1, totalPages);
      return { state, context: { ...ctx, page: newPage } };
    }

    case "SET_COUNT": {
      const newTotalPages = Math.max(1, Math.ceil(event.count / ctx.pageSize));
      const newPage = clampPage(ctx.page, newTotalPages);
      return { state, context: { ...ctx, count: event.count, page: newPage } };
    }

    case "SET_PAGE_SIZE": {
      const newTotalPages = Math.max(1, Math.ceil(ctx.count / event.pageSize));
      const newPage = clampPage(ctx.page, newTotalPages);
      return { state, context: { ...ctx, pageSize: event.pageSize, page: newPage } };
    }

    default:
      return { state, context: ctx };
  }
}

export function createPaginationMachine(ctx: Partial<PaginationContext> & { id: string }) {
  const count = ctx.count ?? 0;
  const pageSize = ctx.pageSize ?? 10;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const initialContext: PaginationContext = {
    count,
    pageSize,
    page: clampPage(ctx.page ?? 1, totalPages),
    siblingCount: ctx.siblingCount ?? 1,
    id: ctx.id,
  };

  return {
    initialState: "idle" as PaginationState,
    initialContext,
    transition,
  };
}
