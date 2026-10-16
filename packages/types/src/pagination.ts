/**
 * 페이지네이션 계약 표준.
 *
 * 정의:
 * - 프론트 내부 표준은 offset 기반에서 `page` + `limit` 조합을 사용한다.
 * - 백엔드가 `size` 같은 다른 필드명을 쓰더라도 변환은 어댑터 레이어에서만 처리한다.
 * - offset 기반과 cursor 기반 계약은 혼동하지 않도록 별도 타입으로 분리한다.
 *
 * use case:
 * - `@click-b/hook`의 `usePagination` 반환 타입
 * - `@click-b/api-client`의 목록 응답 메타 타입
 * - 앱 레벨 fetcher/query가 공유하는 리스트 조회 계약
 *
 * 지침:
 * - 새 목록 조회 API는 내부 코드에서 `PaginationParams` / `PaginationMeta`를 우선 사용한다.
 * - cursor 기반 API가 필요하면 `CursorPagination*` 타입을 명시적으로 사용한다.
 * - 레거시 `Pagination`은 하위 호환 alias로만 유지한다.
 */

export interface OffsetPaginationParams {
  page: number;
  limit: number;
}

export type PaginationParams = OffsetPaginationParams;

export interface PaginationMeta extends OffsetPaginationParams {
  total: number;
  totalPages: number;
}

export interface CursorPaginationParams {
  cursor?: string | null;
  limit: number;
}

export interface CursorPaginationMeta {
  nextCursor?: string | null;
  prevCursor?: string | null;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  pagination: CursorPaginationMeta;
}

/**
 * @deprecated `PaginationMeta`를 사용한다.
 */
export type Pagination = PaginationMeta;
