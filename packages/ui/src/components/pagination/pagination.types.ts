/**
 * Pagination React 컴포넌트 타입 정의
 */

import type { PageItem } from "@/machines/pagination";

export interface PaginationRootProps extends React.HTMLAttributes<HTMLElement> {
  /** 총 아이템 수 */
  count: number;
  /** 페이지당 아이템 수 */
  pageSize?: number;
  /** 현재 페이지 (controlled, 1-based) */
  page?: number;
  /** 기본 페이지 (uncontrolled) */
  defaultPage?: number;
  /** 페이지 변경 콜백 */
  onPageChange?: (page: number) => void;
  /** 현재 페이지 양쪽에 표시할 페이지 수 */
  siblingCount?: number;
  children?: React.ReactNode;
}

export interface PaginationPrevTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface PaginationNextTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export interface PaginationItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 페이지 번호 (필수) */
  value: number;
  children?: React.ReactNode;
}

export interface PaginationEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** ellipsis 인덱스 */
  index: number;
  children?: React.ReactNode;
}

/** 내부 Context */
export interface PaginationContextValue {
  page: number;
  totalPages: number;
  pages: PageItem[];
  isFirstPage: boolean;
  isLastPage: boolean;
  setPage: (page: number) => void;
  getRootProps: () => Record<string, unknown>;
  getPrevTriggerProps: () => Record<string, unknown>;
  getNextTriggerProps: () => Record<string, unknown>;
  getItemProps: (props: { value: number }) => Record<string, unknown>;
  getEllipsisProps: (props: { index: number }) => Record<string, unknown>;
}
