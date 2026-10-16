import {
  useStatGenbaMonthCount,
  type StatGenbaMonthCountSearch,
  type StatGenbaDayRow,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_genba_month_count";

const nf = (n: number) => n.toLocaleString("en-US");
const round2 = (n: number) => String(Math.round(n * 100) / 100);
const pad2 = (n: number) => String(n).padStart(2, "0");
// legacy: total_ActualBuyingPrice < 500이면 ×1500(월별은 임계값 500 — 일별 #241은 300).
const convertActual = (raw: number) => (raw < 500 ? raw * 1500 : raw);

// legacy statistics/order/order_genba_month_count.php — Genba 월별 주문현황(#241 자매, 동기화 없음).
export const StatisticsGenbaMonthCountScreen = (search: StatGenbaMonthCountSearch) => {
  const now = new Date();
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatGenbaMonthCountSearch = { search_year: year, search_month: month };

  const { data } = useStatGenbaMonthCount(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

  const items = data?.items ?? [];

  // tfoot 합계(actual은 환산값 누적).
  let totalCount = 0;
  let totalGross = 0;
  let totalNet = 0;
  let totalActual = 0;
  for (const r of items) {
    totalCount += r.total_count;
    totalGross += r.total_gross_amount;
    totalNet += r.total_net_amount;
    totalActual += convertActual(r.total_actual_buying_price);
  }
  const totalProfit = totalNet - totalActual;

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
                    주문분석
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 월별 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 월별 주문현황</h4>
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
                  <th className="text-center">Publisher</th>
                  <th className="text-center">SKU</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">주문수량</th>
                  <th className="text-center">GrossAmount 합계</th>
                  <th className="text-center">NetAmount 합계</th>
                  <th className="text-center">ActualBuyingPrice 합계</th>
                  <th className="text-center">DGKR 이익</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {items.map((row) => (
                  <StatGenbaMonthRowView key={row.sku} row={row} />
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={3} className="text-center">
                    합계
                  </th>
                  <th className="text-end">{nf(totalCount)}</th>
                  <th className="text-end">{nf(totalGross)}</th>
                  <th className="text-end">{nf(totalNet)}</th>
                  <th className="text-end">{nf(totalActual)}</th>
                  <th className="text-end">
                    {totalNet > 0 && (
                      <>
                        {nf(totalProfit)}
                        <br />({round2((totalProfit * 100) / totalNet)} %)
                      </>
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        {/* end col */}
      </div>
    </>
  );
};

const StatGenbaMonthRowView = ({ row }: { row: StatGenbaDayRow }) => {
  const actual = convertActual(row.total_actual_buying_price);
  const profit = row.total_net_amount - actual;
  const textColor = profit < 0 ? "text-danger" : "";
  return (
    <tr>
      <td>{row.publisher}</td>
      <td className="text-center">{row.sku}</td>
      <td>{row.name}</td>
      <td className="text-end">{nf(row.total_count)}</td>
      <td className="text-end">{nf(row.total_gross_amount)}</td>
      <td className="text-end">{nf(row.total_net_amount)}</td>
      <td className="text-end">{nf(actual)}</td>
      <td className={`text-end ${textColor}`}>
        {nf(profit)}
        <br />
        {row.total_net_amount > 0 && <>({round2((profit * 100) / row.total_net_amount)}%)</>}
      </td>
    </tr>
  );
};
