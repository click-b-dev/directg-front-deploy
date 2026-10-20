// 목록 하단 "페이지당 개수" 선택지와 기본값. 서버(mock 포함)는 per_page를 받아 그 개수만큼 돌려준다.
export const PAGE_SIZE_OPTIONS = [20, 50, 100];
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

export const parsePageSize = (value: unknown) => {
  const size = Number(value);
  return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
};
