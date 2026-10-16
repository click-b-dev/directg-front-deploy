import { useCallback, useMemo, useState } from "react";
import type { OffsetPaginationParams, PaginationMeta } from "@click-b/types";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
  totalPages?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  setLimit: (limit: number) => void;
  resetPage: () => void;
  params: OffsetPaginationParams;
  pagination: PaginationMeta;
}

/**
 * 페이지네이션 상태를 관리하는 훅.
 * 데이터 페칭은 포함하지 않으며, 페이지 상태와 탐색 로직만 제공한다.
 * 내부 계약은 `page` + `limit` 기반 offset pagination을 따른다.
 * 백엔드가 `size` 같은 필드명을 쓰면 fetcher/adapter에서 변환한다.
 *
 * @example
 * const { page, params, pagination, nextPage, prevPage, hasNext, hasPrev } =
 *   usePagination({ initialLimit: 20, total: data?.pagination.total });
 */
export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const { initialPage = 1, initialLimit = 10, total, totalPages: totalPagesProp } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const totalPages = useMemo(() => {
    if (totalPagesProp !== undefined) return totalPagesProp;
    if (total !== undefined) return Math.ceil(total / limit);
    return undefined;
  }, [totalPagesProp, total, limit]);

  const hasNext = totalPages === undefined ? true : page < totalPages;
  const hasPrev = page > 1;

  const clamp = useCallback(
    (p: number) => {
      if (p < 1) return 1;
      if (totalPages !== undefined && p > totalPages) return totalPages;
      return p;
    },
    [totalPages],
  );

  const goToPage = useCallback((p: number) => setPage(clamp(p)), [clamp]);

  const nextPage = useCallback(() => setPage((prev) => clamp(prev + 1)), [clamp]);
  const prevPage = useCallback(() => setPage((prev) => clamp(prev - 1)), [clamp]);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  const params = useMemo<OffsetPaginationParams>(() => ({ page, limit }), [page, limit]);

  const pagination: PaginationMeta = useMemo(
    () => ({
      page,
      limit,
      total: total ?? 0,
      totalPages: totalPages ?? 0,
    }),
    [page, limit, total, totalPages],
  );

  return {
    page,
    limit,
    totalPages: totalPages ?? 0,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
    setLimit,
    resetPage,
    params,
    pagination,
  };
};
