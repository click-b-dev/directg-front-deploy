import {
  useStatAssetMonthCount,
  type StatAssetMonthCountSearch,
  type StatAssetDayRow,
} from "@entities/statistics";
import { ServerPagination } from "@shared/ui";

const BASE_URL = "/statistics/order/order_asset_month_count";

const nf = (n: number) => n.toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");

// legacy statistics/order/order_asset_month_count.php — Asset 월별 주문현황(#237 자매).
export const StatisticsAssetMonthCountScreen = (search: StatAssetMonthCountSearch) => {
  const now = new Date();
  // legacy 31~37: 미지정 시 오늘 Y/m.
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatAssetMonthCountSearch = {
    search_year: year,
    search_month: month,
    page: search.page || 1,
  };

  const { data } = useStatAssetMonthCount(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

  const paginationParams: Record<string, string> = {
    search_year: year,
    search_month: month,
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalCount = items.reduce((s, r) => s + r.total_count, 0);

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
                    Asset 주문 분석
                  </a>
                </li>
                <li className="breadcrumb-item active">Asset 월별 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 월별 주문현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form
                className="row row-cols-lg-auto g-3 align-items-center mb-3"
                action={BASE_URL}
                method="get"
              >
                <div className="col-12">
                  <div className="d-flex align-items-center">
                    <label htmlFor="search_year" className="col-4 col-form-label me-2">
                      주문날짜
                    </label>
                    <div className="col-8">
                      <select
                        className="form-select"
                        id="search_year"
                        name="search_year"
                        defaultValue={year}
                      >
                        <option value="">:::년도:::</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}년
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <select
                    className="form-select"
                    id="search_month"
                    name="search_month"
                    defaultValue={month}
                  >
                    <option value="">:::월:::</option>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-3">
                  <div className="col-auto">
                    <button className="input-group-text btn-primary shadow-none" type="submit">
                      검색
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm mb-3">
              <thead className="table-light font-13">
                <tr>
                  <th className="text-center">Asset Publisher</th>
                  <th className="text-center">Asset ID</th>
                  <th className="text-center">Asset Name</th>
                  <th className="text-center">Product Type</th>
                  <th className="text-center">Asset Type</th>
                  <th className="text-center">Asset Platform</th>
                  <th className="text-center">주문수량</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {items.map((row) => (
                  <StatAssetMonthRowView key={row.asset_id} row={row} />
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={3} className="text-center">
                    합계
                  </th>
                  <th className="text-end"></th>
                  <th className="text-end"></th>
                  <th className="text-end"></th>
                  <th className="text-end">{nf(totalCount)}</th>
                </tr>
              </tfoot>
            </table>
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
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const StatAssetMonthRowView = ({ row }: { row: StatAssetDayRow }) => (
  <tr>
    <td className="text-center">{row.publisher}</td>
    <td className="text-center">{row.asset_id}</td>
    <td>{row.asset_name}</td>
    <td className="text-center">{row.productType}</td>
    <td className="text-center">{row.assetType}</td>
    <td className="text-center">{row.platform}</td>
    <td className="text-end">{nf(row.total_count)}</td>
  </tr>
);
