// legacy _inc.php pn_pagination_html — 전체 페이지 수가 명확할 때(페이지 기반).
// « ‹ [1 …] window … last › » 형태(window=5).
type Item = { page: number; label: string; disabled?: boolean; active?: boolean };

export const PnPagination = ({
  page,
  totalPages,
  baseUrl,
  baseParams,
  window: win = 5,
}: {
  page: number;
  totalPages: number;
  baseUrl: string;
  baseParams: Record<string, string>;
  window?: number;
}) => {
  const total = Math.max(1, totalPages);
  if (total <= 1) {
    return null;
  }
  const cur = Math.max(1, page);
  const start = Math.max(1, cur - win);
  const end = Math.min(total, cur + win);

  const items: (Item | "ellipsis")[] = [];
  items.push({ page: 1, label: "«", disabled: cur <= 1 });
  items.push({ page: Math.max(1, cur - 1), label: "‹", disabled: cur <= 1 });
  if (start > 1) {
    items.push({ page: 1, label: "1" });
    if (start > 2) {
      items.push("ellipsis");
    }
  }
  for (let i = start; i <= end; i++) {
    items.push({ page: i, label: String(i), active: i === cur });
  }
  if (end < total) {
    if (end < total - 1) {
      items.push("ellipsis");
    }
    items.push({ page: total, label: String(total) });
  }
  items.push({ page: Math.min(total, cur + 1), label: "›", disabled: cur >= total });
  items.push({ page: total, label: "»", disabled: cur >= total });

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
