import { Pagination } from "./pagination";
import { Select } from "./select";

type TableFooterProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalResults: number;
  onPageChange: (page: number) => void;
};

// Figma `bottom`: 가운데 Pagination + 오른쪽 페이지당 개수. 개수는 API가 지원하지 않아 고정(비활성)이다.
export const TableFooter = ({
  page,
  totalPages,
  pageSize,
  totalResults,
  onPageChange,
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
        options={[{ value: String(pageSize), label: `${pageSize}개` }]}
        onValueChange={() => undefined}
        disabled
      />
    </div>
  </div>
);
