import { Pagination } from "./pagination";
import { Select } from "./select";

type TableFooterProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  /** 페이지당 개수 선택지. `onPageSizeChange`와 함께 주면 선택할 수 있다 */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
};

// Figma `bottom`: 가운데 Pagination + 오른쪽 페이지당 개수. 개수를 바꿀 수 없는 표는 현재 값만 보이고 비활성이다.
export const TableFooter = ({
  page,
  totalPages,
  pageSize,
  totalResults,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}: TableFooterProps) => (
  <div className="rn:flex rn:items-center">
    <div className="rn:flex-1" />
    <Pagination
      page={page}
      totalPages={totalPages}
      pageSize={pageSize}
      totalResults={totalResults}
      onPageChange={onPageChange}
    />
    <div className="rn:flex rn:flex-1 rn:justify-end">
      <Select
        aria-label="페이지당 개수"
        compact
        rootClassName="rn:w-100"
        value={String(pageSize)}
        options={(pageSizeOptions ?? [pageSize]).map((size) => ({
          value: String(size),
          label: `${size}개`,
        }))}
        onValueChange={(next) => onPageSizeChange?.(Number(next))}
        disabled={!onPageSizeChange}
      />
    </div>
  </div>
);
