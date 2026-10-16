// legacy admin_head.php `renderPaging(options)` 재현.
// jQuery로 HTML 생성 → React 컴포넌트. 블록 계산·마크업·링크 URL을 그대로 옮긴다.
// 총건수(#total)는 소비 측이 표시(이 컴포넌트는 페이지 nav만).

type PaginationParams = Record<string, string | number | undefined | null>;

type PaginationProps = {
  page: number;
  totalPages: number;
  baseUrl: string;
  params?: PaginationParams;
  perBlock?: number;
};

const buildQuery = (params: PaginationParams): string =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("");

export const Pagination = ({
  page,
  totalPages,
  baseUrl,
  params = {},
  perBlock = 10,
}: PaginationProps) => {
  const qs = buildQuery(params);
  // legacy 블록 계산 그대로
  const start = (Math.ceil(page / perBlock) - 1) * perBlock + 1;
  const end = start + perBlock > totalPages ? totalPages + 1 : start + perBlock;
  const href = (targetPage: number) => `${baseUrl}?page=${targetPage}${qs}`;

  const pages: number[] = [];
  for (let i = start; i < end; i += 1) {
    pages.push(i);
  }

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {start <= 1 ? (
          <li className="page-item disabled">
            <a className="page-link">&laquo;</a>
          </li>
        ) : (
          <li className="page-item">
            <a className="page-link" href={href(start - perBlock)}>
              &laquo;
            </a>
          </li>
        )}

        {pages.map((i) =>
          i === page ? (
            <li key={i} className="page-item active">
              <a className="page-link" href="#">
                {i}
              </a>
            </li>
          ) : (
            <li key={i} className="page-item">
              <a className="page-link" href={href(i)}>
                {i}
              </a>
            </li>
          ),
        )}

        {end > totalPages ? (
          <li className="page-item disabled">
            <a className="page-link">&raquo;</a>
          </li>
        ) : (
          <li className="page-item">
            <a className="page-link" href={href(end)}>
              &raquo;
            </a>
          </li>
        )}
      </ul>
    </nav>
  );
};
