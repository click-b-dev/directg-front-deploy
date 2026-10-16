import { useRef } from "react";
import {
  useStatTitleRanking,
  useRunStatTitleBestSaveReload,
  type StatTitleRankingSearch,
  type StatTitleRankingRow,
} from "@entities/statistics";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/statistics/goods/title_ranking";
const PER_PAGE = 50;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy statistics/goods/title_ranking.php — 인기타이틀 순위(tbl_sales_ranking 읽기 뷰).
export const StatisticsTitleRankingScreen = (search: StatTitleRankingSearch) => {
  const now = new Date();
  const resolved: StatTitleRankingSearch = {
    search_year: search.search_year,
    search_month: search.search_month,
    page: search.page || 1,
  };

  const { data } = useStatTitleRanking(resolved);
  const bestSave = useRunStatTitleBestSaveReload();

  const yearRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);

  // 연도 옵션 2013~현재, 월 01~12.
  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  // legacy btn_best_save: 클릭 시점 select 값 → best-save → alert + reload(랭킹 invalidate).
  const handleBestSave = () => {
    bestSave.mutate(
      {
        search_year: yearRef.current?.value ?? search.search_year,
        search_month: monthRef.current?.value ?? search.search_month,
      },
      { onSuccess: () => window.alert("집계가 완료되었습니다.") },
    );
  };

  // 페이지네이션 파라미터(page 제외 검색값 유지).
  const paginationParams: Record<string, string> = {};
  if (search.search_year !== "") paginationParams.search_year = search.search_year;
  if (search.search_month !== "") paginationParams.search_month = search.search_month;

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
                    상품 분석
                  </a>
                </li>
                <li className="breadcrumb-item active">인기타이틀 순위</li>
              </ol>
            </div>
            <h4 className="page-title">인기타이틀 순위</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row g-2">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body py-2">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-12">
                    <div className="row">
                      <label
                        htmlFor="search_year"
                        className="col-sm-2 col-form-label bg-light border"
                      >
                        주문기간
                      </label>
                      <div className="col-sm-4">
                        <div className="input-group">
                          <select
                            ref={yearRef}
                            className="form-select me-2"
                            id="search_year"
                            name="search_year"
                            defaultValue={search.search_year}
                          >
                            <option value="">:::년:::</option>
                            {years.map((y) => (
                              <option key={y} value={y}>
                                {y}년
                              </option>
                            ))}
                          </select>
                          <select
                            ref={monthRef}
                            className="form-select"
                            id="search_month"
                            name="search_month"
                            defaultValue={search.search_month}
                          >
                            <option value="">:::월:::</option>
                            {months.map((m) => (
                              <option key={m} value={m}>
                                {m}월
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="col-auto">
                        <button className="input-group-text btn-primary shadow-none" type="submit">
                          검 색
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <button
        className="input-group-text btn-primary shadow-none"
        id="btn_best_save"
        type="button"
        onClick={handleBestSave}
      >
        인기타이틀 집계 저장
      </button>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-bordered table-centered table-sm">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center" style={{ width: "50px" }}>
                        순위
                      </th>
                      <th className="text-center" style={{ width: "50px" }}>
                        대표상품코드
                      </th>
                      <th className="text-center" style={{ width: "300px" }}>
                        대표상품명
                      </th>
                      <th className="text-center" style={{ width: "170px" }}>
                        퍼블리셔
                      </th>
                      <th className="text-center" style={{ width: "80px" }}>
                        출시일
                      </th>
                      <th className="text-center" style={{ width: "60px" }}>
                        Game <br />
                        주문수량
                      </th>
                      <th className="text-center" style={{ width: "70px" }}>
                        Game <br />
                        주문금액
                      </th>
                      <th className="text-center" style={{ width: "60px" }}>
                        DLC <br />
                        주문수량
                      </th>
                      <th className="text-center" style={{ width: "70px" }}>
                        DLC <br />
                        주문금액
                      </th>
                      <th className="text-center" style={{ width: "60px" }}>
                        합계 <br />
                        주문수량
                      </th>
                      <th className="text-center" style={{ width: "70px" }}>
                        합계 <br />
                        주문금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {items.map((row, index) => (
                      <StatRankingRow
                        key={row.title_id}
                        row={row}
                        no={(resolved.page - 1) * PER_PAGE + index + 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
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
    </>
  );
};

const StatRankingRow = ({ row, no }: { row: StatTitleRankingRow; no: number }) => (
  <tr>
    <td className="text-center">{no}</td>
    <td className="text-center">{row.title_id}</td>
    <td className="">{row.title_name}</td>
    <td className="text-center">{row.publisher}</td>
    <td className="text-center">{row.release_date}</td>
    <td className="text-end">
      <span className="num">{nf(row.total_count)}</span>
    </td>
    <td className="text-end">
      <span className="num">{nf(row.total_price)}</span>
    </td>
    <td className="text-end">
      <span className="num">{nf(row.dlc_count)}</span>
    </td>
    <td className="text-end">
      <span className="num">{nf(row.dlc_price)}</span>
    </td>
    <td className="text-end">
      <span className="num">{nf(row.total_count + row.dlc_count)}</span>
    </td>
    <td className="text-end">
      <span className="num">{nf(row.total_price + row.dlc_price)}</span>
    </td>
  </tr>
);
