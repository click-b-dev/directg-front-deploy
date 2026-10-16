// legacy src/classes/Pagination.php (BenGriffiths) build_links 재현.
// banner_list.php 옵션 기준: results_per_page=20, First/Prev/Next/Last(±10 점프), ellipses,
// dead link=d-none, current=active, ul=pagination pagination-lg text-nowrap.
// #5 shared/ui/pagination(renderPaging/AJAX용)과 별개 — legacy에 두 페이징 시스템 공존.

type PaginationParams = Record<string, string | number | undefined | null>;

type ServerPaginationProps = {
  page: number;
  totalPages: number;
  baseUrl: string;
  params?: PaginationParams;
};

// legacy 옵션 상수(banner_list getMainbannerList + Pagination 기본값)
const MAX_LINKS_BETWEEN = 7;
const MAX_LINKS_OUTSIDE = 2;
// number_of_links_before_showing_ellipses = 7 + 2*2 = 11
const LINKS_BEFORE_ELLIPSES = MAX_LINKS_BETWEEN + MAX_LINKS_OUTSIDE * 2;
const TEXT_FIRST = "« First";
const TEXT_PREV = "« Prev";
const TEXT_NEXT = "Next »";
const TEXT_LAST = "Last »";
const TEXT_ELLIPSES = "...";

type LiItem =
  | { kind: "link"; key: string; className: string; text: string; targetPage: number }
  | { kind: "span"; key: string; className: string; text: string };

const range = (start: number, finish: number): number[] => {
  const out: number[] = [];
  for (let i = start; i <= finish; i += 1) {
    out.push(i);
  }
  return out;
};

export const ServerPagination = ({
  page,
  totalPages,
  baseUrl,
  params = {},
}: ServerPaginationProps) => {
  if (totalPages < 1) {
    return null;
  }

  const qs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("");

  const currentClass = (n: number) => (n === page ? "page-item active" : "page-item");
  const numberLinks: LiItem[] = [];
  const pushLinks = (start: number, finish: number, block: string) => {
    for (const i of range(start, finish)) {
      numberLinks.push({
        kind: "link",
        key: `${block}-${i}`,
        className: currentClass(i),
        text: String(i),
        targetPage: i,
      });
    }
  };
  const pushEllipses = (block: string) =>
    numberLinks.push({
      kind: "span",
      key: `ellipses-${block}`,
      className: "ellipses",
      text: TEXT_ELLIPSES,
    });

  // 메인 번호 링크 (legacy build_links 분기 그대로)
  if (totalPages <= LINKS_BEFORE_ELLIPSES) {
    pushLinks(1, totalPages, "all");
  } else if (page <= MAX_LINKS_BETWEEN + MAX_LINKS_OUTSIDE - 2) {
    pushLinks(1, MAX_LINKS_BETWEEN + MAX_LINKS_OUTSIDE, "a0");
    pushEllipses("a");
    pushLinks(totalPages - MAX_LINKS_OUTSIDE + 1, totalPages, "a1");
  } else if (page < totalPages - (MAX_LINKS_BETWEEN + MAX_LINKS_OUTSIDE) + 1 + 2) {
    pushLinks(1, MAX_LINKS_OUTSIDE, "b0");
    pushEllipses("b1");
    const beforeAfter = (MAX_LINKS_BETWEEN - 1) / 2;
    pushLinks(page - beforeAfter, page + beforeAfter, "b1mid");
    pushEllipses("b2");
    pushLinks(totalPages - MAX_LINKS_OUTSIDE + 1, totalPages, "b2end");
  } else {
    pushLinks(1, MAX_LINKS_OUTSIDE, "c0");
    pushEllipses("c");
    pushLinks(totalPages - (MAX_LINKS_BETWEEN + MAX_LINKS_OUTSIDE) + 1, totalPages, "c1");
  }

  const prevTarget = Math.max(1, page - 10);
  const nextTarget = Math.min(totalPages, page + 10);
  const isFirst = page === 1;
  const isLast = page === totalPages;

  const items: LiItem[] = [
    // First
    isFirst
      ? { kind: "span", key: "first", className: "d-none", text: TEXT_FIRST }
      : { kind: "link", key: "first", className: "page-item", text: TEXT_FIRST, targetPage: 1 },
    // Prev (−10 페이지)
    isFirst
      ? { kind: "span", key: "prev", className: "d-none", text: TEXT_PREV }
      : {
          kind: "link",
          key: "prev",
          className: "page-item",
          text: TEXT_PREV,
          targetPage: prevTarget,
        },
    ...numberLinks,
    // Next (+10 페이지)
    isLast
      ? { kind: "span", key: "next", className: "page-item d-none", text: TEXT_NEXT }
      : {
          kind: "link",
          key: "next",
          className: "page-item",
          text: TEXT_NEXT,
          targetPage: nextTarget,
        },
    // Last
    isLast
      ? { kind: "span", key: "last", className: "page-item d-none", text: TEXT_LAST }
      : {
          kind: "link",
          key: "last",
          className: "page-item",
          text: TEXT_LAST,
          targetPage: totalPages,
        },
  ];

  const href = (targetPage: number) => `${baseUrl}?page=${targetPage}${qs}`;

  return (
    <ul className="pagination pagination-lg text-nowrap justify-content-center">
      {items.map((item) =>
        item.kind === "link" ? (
          <li key={item.key} className={item.className}>
            <a href={href(item.targetPage)} className="page-link">
              {item.text}
            </a>
          </li>
        ) : (
          <li key={item.key} className={item.className}>
            <span className="page-link">{item.text}</span>
          </li>
        ),
      )}
    </ul>
  );
};
