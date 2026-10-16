/**
 * Pagination connect — 머신 상태를 DOM 속성으로 변환
 */

import { dataAttr } from "@/machines/shared";
import type { Send } from "@/machines/shared";
import type { PaginationState, PaginationContext, PaginationEvent } from "./types";
import { computePageRange } from "./machine";
import { SCOPE, paginationAnatomy } from "./anatomy";

export function connect(
  _state: PaginationState,
  ctx: PaginationContext,
  send: Send<PaginationEvent>,
) {
  const totalPages = Math.max(1, Math.ceil(ctx.count / ctx.pageSize));
  const isFirstPage = ctx.page <= 1;
  const isLastPage = ctx.page >= totalPages;
  const pages = computePageRange(ctx);

  return {
    /** 현재 페이지 */
    page: ctx.page,

    /** 전체 페이지 수 */
    totalPages,

    /** 페이지 범위 아이템 (ellipsis 포함) */
    pages,

    /** 첫 페이지 여부 */
    isFirstPage,

    /** 마지막 페이지 여부 */
    isLastPage,

    /** 페이지 설정 */
    setPage(page: number) {
      send({ type: "SET_PAGE", page });
    },

    /** 다음 페이지 */
    nextPage() {
      send({ type: "NEXT_PAGE" });
    },

    /** 이전 페이지 */
    prevPage() {
      send({ type: "PREV_PAGE" });
    },

    /** Root 속성 */
    getRootProps() {
      return {
        "aria-label": "Pagination",
        "data-scope": SCOPE,
        "data-part": paginationAnatomy.root,
      };
    },

    /** 이전 버튼 속성 */
    getPrevTriggerProps() {
      return {
        type: "button" as const,
        "aria-label": "Previous page",
        disabled: isFirstPage,
        "data-scope": SCOPE,
        "data-part": paginationAnatomy.prevTrigger,
        "data-disabled": dataAttr(isFirstPage),
        onClick() {
          send({ type: "PREV_PAGE" });
        },
      };
    },

    /** 다음 버튼 속성 */
    getNextTriggerProps() {
      return {
        type: "button" as const,
        "aria-label": "Next page",
        disabled: isLastPage,
        "data-scope": SCOPE,
        "data-part": paginationAnatomy.nextTrigger,
        "data-disabled": dataAttr(isLastPage),
        onClick() {
          send({ type: "NEXT_PAGE" });
        },
      };
    },

    /** 페이지 번호 버튼 속성 */
    getItemProps(props: { value: number }) {
      const isCurrent = ctx.page === props.value;
      return {
        type: "button" as const,
        "aria-label": `Page ${props.value}`,
        "aria-current": isCurrent ? ("page" as const) : undefined,
        "data-scope": SCOPE,
        "data-part": paginationAnatomy.item,
        "data-selected": dataAttr(isCurrent),
        "data-value": props.value,
        onClick() {
          send({ type: "SET_PAGE", page: props.value });
        },
      };
    },

    /** Ellipsis 속성 */
    getEllipsisProps(props: { index: number }) {
      return {
        "data-scope": SCOPE,
        "data-part": paginationAnatomy.ellipsis,
        "data-index": props.index,
      };
    },
  };
}
