// legacy _inc.php pn_pagination_cursor — 전체 페이지 수 불명 API용 커서 페이지네이션.
// has_more가 true면 현재 응답이 limit만큼 차있어 다음 페이지가 있다고 가정.
type Item = { page: number; label: string; disabled?: boolean; active?: boolean };

export const PnCursorPagination = ({
  page,
  hasMore,
  baseUrl,
  baseParams,
  windowBack = 4,
  windowFwd = 5,
}: {
  page: number;
  hasMore: boolean;
  baseUrl: string;
  baseParams: Record<string, string>;
  windowBack?: number;
  windowFwd?: number;
}) => {
  const cur = Math.max(1, page);
  if (cur <= 1 && !hasMore) {
    return null;
  }

  const start = Math.max(1, cur - windowBack);
  const end = hasMore ? cur + windowFwd : cur;

  const items: (Item | "ellipsis")[] = [];
  items.push({ page: 1, label: "«", disabled: cur <= 1 });
  items.push({ page: Math.max(1, cur - 1), label: "‹ 이전", disabled: cur <= 1 });
  if (start > 1) {
    items.push({ page: 1, label: "1" });
    if (start > 2) {
      items.push("ellipsis");
    }
  }
  for (let i = start; i <= end; i++) {
    items.push({ page: i, label: String(i), active: i === cur });
  }
  items.push({ page: cur + 1, label: "다음 ›", disabled: !hasMore });

  const href = (p: number) => {
    const params = new URLSearchParams({ ...baseParams, page: String(p) });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <nav>
      <ul className="pagination pagination-sm mb-0">
        {items.map((it, idx) => {
          if (it === "ellipsis") {
            return (
              <li className="page-item disabled" key={`e${idx}`}>
                <span className="page-link">…</span>
              </li>
            );
          }
          if (it.disabled) {
            return (
              <li className="page-item disabled" key={idx}>
                <span className="page-link">{it.label}</span>
              </li>
            );
          }
          return (
            <li className={`page-item${it.active ? " active" : ""}`} key={idx}>
              <a className="page-link" href={href(it.page)}>
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
