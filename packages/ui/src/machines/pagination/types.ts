/**
 * Pagination 상태머신 타입 정의
 * 페이지 네비게이션 패턴
 */

/** Pagination 상태: 단일 상태 */
export type PaginationState = "idle";

/** Pagination 컨텍스트 */
export interface PaginationContext {
  /** 총 아이템 수 */
  count: number;
  /** 페이지당 아이템 수 */
  pageSize: number;
  /** 현재 페이지 (1-based) */
  page: number;
  /** 현재 페이지 양쪽에 표시할 페이지 수 */
  siblingCount: number;
  /** 컴포넌트 고유 ID */
  id: string;
}

/** 페이지 범위 아이템 타입 */
export type PageItem =
  | { type: "page"; value: number }
  | { type: "ellipsis"; position: "start" | "end" };

/** Pagination 이벤트 */
export type PaginationEvent =
  | { type: "SET_PAGE"; page: number }
  | { type: "NEXT_PAGE" }
  | { type: "PREV_PAGE" }
  | { type: "SET_COUNT"; count: number }
  | { type: "SET_PAGE_SIZE"; pageSize: number };
