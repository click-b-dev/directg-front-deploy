import { useStatSalesPgCount, type StatSalesPgCountSearch } from "@entities/statistics";

const BASE_URL = "/statistics/sales/sales_pg";

const nf = (n: number) => n.toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");
const round2 = (n: number) => String(Math.round(n * 100) / 100);

// legacy 표시 순서: KCP / 네이버페이 / 페이코 / 토스페이먼츠 / 토스페이.
const PG_COLUMNS = [
  { key: "kcp", label: "KCP" },
  { key: "naverpay", label: "네이버페이" },
  { key: "payco", label: "페이코" },
  { key: "toss", label: "토스페이먼츠" },
  { key: "toss_pay", label: "토스페이" },
] as const;

// legacy: total>0 이면 round(value*100/total,2), 아니면 문자열 "0".
const pct = (value: number, total: number) => (total > 0 ? round2((value * 100) / total) : "0");

type DayAgg = {
  providers: Map<string, { count: number; price: number }>;
  totalCount: number; // 해당 일자 전체 pg_provider 합산(표시 외 provider 포함) — legacy 일별 비율 분모
  totalPrice: number;
};

type CellView = { count: number; price: number; countPct: string; pricePct: string };
type RowView = { orderDay: string; cells: CellView[] };

// legacy statistics/sales/sales_pg.php — PG별 결제현황.
export const StatisticsSalesPgScreen = (search: StatSalesPgCountSearch) => {
  const now = new Date();
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatSalesPgCountSearch = { search_year: year, search_month: month };

  const { data } = useStatSalesPgCount(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));

  const dayCount = new Date(Number(year), Number(month), 0).getDate();

  // legacy $sales_data 피벗: 일자 → provider → {count, price} + 일자별 전체 provider 합산.
  const byDate = new Map<string, DayAgg>();
  for (const row of data?.rows ?? []) {
    let agg = byDate.get(row.ord_ymd);
    if (!agg) {
      agg = { providers: new Map(), totalCount: 0, totalPrice: 0 };
      byDate.set(row.ord_ymd, agg);
    }
    agg.providers.set(row.pg_provider, { count: row.checkout_count, price: row.checkout_price });
    agg.totalCount += row.checkout_count;
    agg.totalPrice += row.checkout_price;
  }

  // tfoot 합계: legacy는 표시 5개 PG만 누적한다($total_count/$total_price).
  // → 일별 행 비율 분모(전체 provider)와 tfoot 비율 분모(5개 PG)가 달라지는 quirk를 그대로 이식.
  const pgTotals = PG_COLUMNS.map(() => ({ count: 0, price: 0 }));
  let grandCount = 0;
  let grandPrice = 0;

  const rows: RowView[] = Array.from({ length: dayCount }, (_, i) => {
    const orderDay = `${year}-${month}-${pad2(i + 1)}`;
    const agg = byDate.get(orderDay);
    const cells = PG_COLUMNS.map((col, colIndex) => {
      const cell = agg?.providers.get(col.key);
      const count = cell?.count ?? 0;
      const price = cell?.price ?? 0;
      pgTotals[colIndex].count += count;
      pgTotals[colIndex].price += price;
      grandCount += count;
      grandPrice += price;
      return {
        count,
        price,
        countPct: pct(count, agg?.totalCount ?? 0),
        pricePct: pct(price, agg?.totalPrice ?? 0),
      };
    });
    return { orderDay, cells };
  });

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
                    결제분석
                  </a>
                </li>
                <li className="breadcrumb-item active">PG별 결제현황</li>
              </ol>
            </div>
            <h4 className="page-title">PG별 결제현황</h4>
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

              <div className="table-responsive">
                <table className="table table-centered w-100 dt-responsive nowrap table-bordered table-sm">
                  <thead className="table-light font-13">
                    <tr>
                      <th className="text-center" rowSpan={2}>
                        날짜
                      </th>
                      {PG_COLUMNS.map((col) => (
                        <th key={col.key} className="text-center" colSpan={2}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {PG_COLUMNS.map((col) => (
                        <ProviderHeadCells key={col.key} />
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {rows.map((row) => (
                      <tr key={row.orderDay}>
                        <td className="text-center">{row.orderDay}</td>
                        {row.cells.map((cell, i) => (
                          <ProviderCells key={PG_COLUMNS[i].key} cell={cell} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th className="text-center">합계</th>
                      {pgTotals.map((total, i) => (
                        <ProviderFootCells
                          key={PG_COLUMNS[i].key}
                          count={total.count}
                          price={total.price}
                          countPct={pct(total.count, grandCount)}
                          pricePct={pct(total.price, grandPrice)}
                        />
                      ))}
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

const ProviderHeadCells = () => (
  <>
    <th className="text-center">결제건수</th>
    <th className="text-center">결제금액</th>
  </>
);

const ProviderCells = ({ cell }: { cell: CellView }) => (
  <>
    <td className="text-end">
      {nf(cell.count)}
      <br />({cell.countPct} %)
    </td>
    <td className="text-end">
      {nf(cell.price)}
      <br />({cell.pricePct} %)
    </td>
  </>
);

const ProviderFootCells = ({
  count,
  price,
  countPct,
  pricePct,
}: {
  count: number;
  price: number;
  countPct: string;
  pricePct: string;
}) => (
  <>
    <th className="text-end">
      {nf(count)}
      <br />({countPct} %)
    </th>
    <th className="text-end">
      {nf(price)}
      <br />({pricePct} %)
    </th>
  </>
);
