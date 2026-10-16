import {
  useStatSalesMonthCount,
  type StatSalesMonthCountRow,
  type StatSalesMonthCountSearch,
} from "@entities/statistics";

const BASE_URL = "/statistics/sales/sales_month";

const nf = (n: number) => n.toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");
const round2 = (n: number) => String(Math.round(n * 100) / 100);

const emptyMonth = (orderMonth: string): StatSalesMonthCountRow => ({
  order_month: orderMonth,
  order_price: 0,
  checkout_price: 0,
  checkout_count: 0,
  emoney: 0,
});

// legacy statistics/sales/sales_month.php — 월별 매출현황.
export const StatisticsSalesMonthScreen = (search: StatSalesMonthCountSearch) => {
  const now = new Date();
  const year = search.search_year || String(now.getFullYear());
  const resolved: StatSalesMonthCountSearch = { search_year: year };

  const { data } = useStatSalesMonthCount(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);

  const byMonth = new Map((data?.months ?? []).map((row) => [row.order_month, row]));
  const rows = Array.from({ length: 12 }, (_, i) => {
    const orderMonth = `${year}-${pad2(i + 1)}`;
    return byMonth.get(orderMonth) ?? emptyMonth(orderMonth);
  });

  let totalCheckoutCount = 0;
  let totalCheckoutPrice = 0;
  let totalUsePoint = 0;
  let totalOrderPrice = 0;
  for (const row of rows) {
    totalCheckoutCount += row.checkout_count;
    totalCheckoutPrice += row.checkout_price;
    totalUsePoint += row.emoney;
    totalOrderPrice += row.order_price;
  }

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
                    매출분석
                  </a>
                </li>
                <li className="breadcrumb-item active">월별 매출현황</li>
              </ol>
            </div>
            <h4 className="page-title">월별 매출현황</h4>
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
                    <label htmlFor="status-select" className="col-4 col-form-label me-2">
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
                <div className="col-3">
                  <div className="col-auto">
                    <button className="input-group-text btn-primary shadow-none" type="submit">
                      검색
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center">날짜</th>
                      <th className="text-center">결제건수</th>
                      <th className="text-center">결제금액</th>
                      <th className="text-center">포인트할인</th>
                      <th className="text-center">할인비율</th>
                      <th className="text-center">주문금액</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {rows.map((row) => (
                      <StatSalesMonthRowView key={row.order_month} row={row} />
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th className="text-center">합계</th>
                      <th className="text-end">{nf(totalCheckoutCount)}</th>
                      <th className="text-end">{nf(totalCheckoutPrice)}</th>
                      <th className="text-end">{nf(totalUsePoint)}</th>
                      <th className="text-end">
                        {totalOrderPrice > 0 &&
                          `${round2((totalUsePoint / totalOrderPrice) * 100)}%`}
                      </th>
                      <th className="text-end">{nf(totalOrderPrice)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* end card-body */}
          </div>
          {/* end card */}
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const StatSalesMonthRowView = ({ row }: { row: StatSalesMonthCountRow }) => (
  <tr>
    <td className="text-center">{row.order_month}</td>
    <td className="text-end">{nf(row.checkout_count)}</td>
    <td className="text-end">{nf(row.checkout_price)}</td>
    <td className="text-end">{nf(row.emoney)}</td>
    <td className="text-end">
      {row.order_price > 0 && `${round2((row.emoney / row.order_price) * 100)}%`}
    </td>
    <td className="text-end">{nf(row.order_price)}</td>
  </tr>
);
