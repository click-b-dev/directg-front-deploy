import {
  useStatMetacriticScore,
  type StatMetacriticScoreSearch,
  type StatMetacriticRow,
} from "@entities/statistics";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/statistics/goods/metacritic_score";
const PER_PAGE = 100;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy statistics/goods/metacritic_score.php — Metacritic 점수 순위(steam_app_list).
export const StatisticsMetacriticScoreScreen = (search: StatMetacriticScoreSearch) => {
  const now = new Date();
  const resolved: StatMetacriticScoreSearch = {
    search_year: search.search_year,
    page: search.page || 1,
  };

  const { data } = useStatMetacriticScore(resolved);

  // 출시연도 옵션 2005~현재.
  const years: number[] = [];
  for (let y = 2005; y <= now.getFullYear(); y++) years.push(y);

  const paginationParams: Record<string, string> = {};
  if (search.search_year !== "") paginationParams.search_year = search.search_year;

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <>
      {/* start page title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    홈
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    통계
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    상품분석
                  </a>
                </li>
                <li className="breadcrumb-item active">Metacritic Score</li>
              </ol>
            </div>
            <h4 className="page-title">Metacritic Score</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">대표상품 검색필터</h5>
          <div className="card-body">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-2">
                  <div className="row">
                    <label
                      htmlFor="search_year"
                      className="col-sm-5 col-form-label bg-light border"
                    >
                      출시연도
                    </label>
                    <div className="col-sm-7">
                      <select
                        className="form-select"
                        id="search_year"
                        name="search_year"
                        defaultValue={search.search_year}
                      >
                        <option value="">::선택::</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      {" "}
                      검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {pagination ? nf(pagination.total_results) : "0"} 개
          <div className="row g-0">
            <div className="col-12">
              <div className="card">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered table-centered w-100 table-sm">
                      <thead className="table-dark font-13">
                        <tr>
                          <th className="text-center">순위</th>
                          <th className="text-center">Steam APP ID</th>
                          <th className="text-center">name</th>
                          <th className="text-center">App Type</th>
                          <th className="text-center">퍼블리셔</th>
                          <th className="text-center">출시일</th>
                          <th className="text-center">스팀 평가수</th>
                          <th className="text-center">Metacritic Score</th>
                          <th className="text-center">Metacritic URL</th>
                        </tr>
                      </thead>
                      <tbody className="font-12">
                        {items.map((row, index) => (
                          <StatMetacriticRowView
                            key={row.appid}
                            row={row}
                            no={index + 1 + PER_PAGE * (resolved.page - 1)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="text-center mt-3">
                  {pagination && (
                    <ServerPagination
                      page={pagination.current_page}
                      totalPages={pagination.total_pages}
                      baseUrl={BASE_URL}
                      params={paginationParams}
                    />
                  )}
                </div>
                {/* end card-body */}
              </div>
              {/* end card */}
            </div>
            {/* end col */}
          </div>
        </div>
      </div>
    </>
  );
};

const StatMetacriticRowView = ({ row, no }: { row: StatMetacriticRow; no: number }) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{row.appid}</td>
    <td>{row.name}</td>
    <td className="text-center">{row.app_type}</td>
    <td>{row.publisher}</td>
    <td className="text-center">{row.release_date}</td>
    <td className="text-end">{nf(row.recommendations)}</td>
    <td className="text-center">{row.metacritic_score}</td>
    <td className="text-center">
      <a
        href={row.metacritic_url}
        className="btn btn-outline-secondary btn-sm"
        target="_blank"
        rel="noreferrer"
      >
        바로가기
      </a>
    </td>
  </tr>
);
