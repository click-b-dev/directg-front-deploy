import { Pagination as BasePagination } from "@click-b/ui";
import pageFirst from "@/renewal/assets/icon-page-first.svg";
import pagePrev from "@/renewal/assets/icon-page-prev.svg";
import pageNext from "@/renewal/assets/icon-page-next.svg";
import pageLast from "@/renewal/assets/icon-page-last.svg";

type PaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalResults: number;
  onPageChange: (page: number) => void;
};

const WINDOW = 5;

// 현재 페이지를 중심으로 최대 WINDOW개 번호를 노출한다.
const getPageNumbers = (page: number, totalPages: number) => {
  const start = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), totalPages - WINDOW + 1));
  const end = Math.min(totalPages, start + WINDOW - 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

// Figma `Pagination` (node 30028:9742): 이동 버튼 32×32(아이콘 28), 현재 페이지 = page 배경 · radius 8 · SemiBold
const NAV =
  "rn:inline-flex rn:size-32 rn:items-center rn:justify-center rn:disabled:opacity-40 rn:data-[disabled]:opacity-40";
const ITEM =
  "rn:inline-flex rn:h-32 rn:min-w-32 rn:items-center rn:justify-center rn:rounded-8 rn:px-6 rn:text-body2 rn:text-ink-2 rn:data-[selected]:bg-page rn:data-[selected]:font-semibold rn:data-[selected]:text-ink";

export const Pagination = ({
  page,
  totalPages,
  pageSize,
  totalResults,
  onPageChange,
}: PaginationProps) => (
  <BasePagination.Root
    count={totalResults}
    pageSize={pageSize}
    page={page}
    onPageChange={onPageChange}
    className="rn:flex rn:items-center"
  >
    <BasePagination.Item value={1} className={NAV} aria-label="첫 페이지" disabled={page === 1}>
      <img src={pageFirst} alt="" width={28} height={28} />
    </BasePagination.Item>
    <BasePagination.PrevTrigger className={NAV} aria-label="이전 페이지">
      <img src={pagePrev} alt="" width={28} height={28} />
    </BasePagination.PrevTrigger>
    {getPageNumbers(page, totalPages).map((value) => (
      <BasePagination.Item key={value} value={value} className={ITEM}>
        {value}
      </BasePagination.Item>
    ))}
    <BasePagination.NextTrigger className={NAV} aria-label="다음 페이지">
      <img src={pageNext} alt="" width={28} height={28} />
    </BasePagination.NextTrigger>
    <BasePagination.Item
      value={totalPages}
      className={NAV}
      aria-label="마지막 페이지"
      disabled={page === totalPages}
    >
      <img src={pageLast} alt="" width={28} height={28} />
    </BasePagination.Item>
  </BasePagination.Root>
);
