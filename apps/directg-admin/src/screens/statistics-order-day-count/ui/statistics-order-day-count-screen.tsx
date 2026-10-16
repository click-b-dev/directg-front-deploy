import {
  useStatOrderDayCount,
  useRunStatOrderDayBatch,
  type StatOrderDayCountSearch,
  type StatOrderDayItem,
  type StatOrderDaySalesBucket,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_day_count";

const nf = (n: number) => n.toLocaleString("en-US");
// legacy round($x, 2) + echo: 소수 둘째자리 반올림, 후행 0 제거.
const round2 = (n: number) => String(Math.round(n * 100) / 100);
const pad2 = (n: number) => String(n).padStart(2, "0");

const ZERO_BUCKET: StatOrderDaySalesBucket = { total_count: 0, total_price: 0 };

// legacy statistics/order/order_day_count.php — 일별 주문집계(page_title "일별 주문현황").
export const StatisticsOrderDayCountScreen = (search: StatOrderDayCountSearch) => {
  const now = new Date();
  // legacy 15~24: search_year 미지정 시 date('Y'), search_month 미지정 시 date('m').
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatOrderDayCountSearch = { search_year: year, search_month: month };

  const { data } = useStatOrderDayCount(resolved);
  const batch = useRunStatOrderDayBatch();

  if (!data) {
    return null;
  }

  // legacy 26: 해당 월 일수.
  const dayCount = new Date(Number(year), Number(month), 0).getDate();

  // sparse days → ord_ymd 조회 맵.
  const byDate = new Map<string, StatOrderDayItem>();
  for (const d of data.days) byDate.set(d.ord_ymd, d);

  // 연도 옵션 2013~현재년 (legacy 120~124).
  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);

  // tfoot 합계 누적 (legacy 210~218).
  let preorderTotalCount = 0;
  let preorderTotalPrice = 0;
  let normalTotalCount = 0;
  let normalTotalPrice = 0;
  let promotionTotalCount = 0;
  let promotionTotalPrice = 0;
  let totalCount = 0;
  let totalPrice = 0;

  type Row = {
    ordYmd: string;
    preorder: StatOrderDaySalesBucket;
    normal: StatOrderDaySalesBucket;
    promotion: StatOrderDaySalesBucket;
    total_count: number;
    total_price: number;
    batch_date: string;
  };
  const rows: Row[] = [];
  for (let dd = 1; dd <= dayCount; dd++) {
    const ordYmd = `${year}-${month}-${pad2(dd)}`;
    const item = byDate.get(ordYmd);
    const preorder = item?.preorder ?? ZERO_BUCKET;
    const normal = item?.normal ?? ZERO_BUCKET;
    const promotion = item?.promotion ?? ZERO_BUCKET;
    const rowTotalCount = item?.total_count ?? 0;
    const rowTotalPrice = item?.total_price ?? 0;

    rows.push({
      ordYmd,
      preorder,
      normal,
      promotion,
      total_count: rowTotalCount,
      total_price: rowTotalPrice,
      batch_date: item?.batch_date ?? "",
    });

    preorderTotalCount += preorder.total_count;
    preorderTotalPrice += preorder.total_price;
    normalTotalCount += normal.total_count;
    normalTotalPrice += normal.total_price;
    promotionTotalCount += promotion.total_count;
    promotionTotalPrice += promotion.total_price;
    totalCount += rowTotalCount;
    totalPrice += rowTotalPrice;
  }

  // legacy 185~199: 건수/금액 비율 셀(항상 % 접미, 값은 total>0일 때만).
  const ratioCell = (
    bucket: StatOrderDaySalesBucket,
    rowTotalCount: number,
    rowTotalPrice: number,
  ) => (
    <>
      {rowTotalCount > 0 ? round2((bucket.total_count * 100) / rowTotalCount) : ""}%<br />(
      {rowTotalPrice > 0 ? round2((bucket.total_price * 100) / rowTotalPrice) : ""}%)
    </>
  );

  const handleBatch = (ordYmd: string) => {
    batch.mutate({ search_year: year, ord_ymd: ordYmd });
  };

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
                <li className="breadcrumb-item active">일별 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">일별 주문현황</h4>
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
                    {Array.from({ length: 12 }, (_, i) => pad2(i + 1)).map((m) => (
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
                      <th className="text-center" colSpan={3}>
                        예약 판매
                      </th>
                      <th className="text-center" colSpan={3}>
                        일반 판매
                      </th>
                      <th className="text-center" colSpan={3}>
                        프로모션 판매
                      </th>
                      <th className="text-center" colSpan={2}>
                        합계
                      </th>
                      <th className="text-center" rowSpan={2}>
                        집계
                      </th>
                    </tr>
                    <tr>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">
                        건수별 비율
                        <br />
                        (금액별 비율)
                      </th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">
                        건수별 비율
                        <br />
                        (금액별 비율)
                      </th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">
                        건수별 비율
                        <br />
                        (금액별 비율)
                      </th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                    </tr>
                  </thead>
                  <tbody className="font-12">
                    {rows.map((row) => (
                      <tr key={row.ordYmd}>
                        <td className="text-center">{row.ordYmd}</td>
                        <td className="text-end">{nf(row.preorder.total_count)}</td>
                        <td className="text-end">{nf(row.preorder.total_price)}</td>
                        <td className="text-end">
                          {ratioCell(row.preorder, row.total_count, row.total_price)}
                        </td>
                        <td className="text-end">{nf(row.normal.total_count)}</td>
                        <td className="text-end">{nf(row.normal.total_price)}</td>
                        <td className="text-end">
                          {ratioCell(row.normal, row.total_count, row.total_price)}
                        </td>
                        <td className="text-end">{nf(row.promotion.total_count)}</td>
                        <td className="text-end">{nf(row.promotion.total_price)}</td>
                        <td className="text-end">
                          {ratioCell(row.promotion, row.total_count, row.total_price)}
                        </td>
                        <td className="text-end">{nf(row.total_count)}</td>
                        <td className="text-end">{nf(row.total_price)}</td>
                        <td className="text-center">
                          {row.batch_date}
                          <br />
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm btn_order_batch"
                            data-date={row.ordYmd}
                            data-year={year}
                            onClick={() => handleBatch(row.ordYmd)}
                          >
                            집계
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th className="text-center">합계</th>
                      <th className="text-end">{nf(preorderTotalCount)}</th>
                      <th className="text-end">{nf(preorderTotalPrice)}</th>
                      {/* legacy: 예약 비율셀 의도적 공란 */}
                      <th className="text-end"></th>
                      <th className="text-end">{nf(normalTotalCount)}</th>
                      <th className="text-end">{nf(normalTotalPrice)}</th>
                      <th className="text-end">
                        {totalCount > 0 && <>{round2((normalTotalCount / totalCount) * 100)}%</>}
                        <br />
                        {totalPrice > 0 && <>({round2((normalTotalPrice / totalPrice) * 100)}%)</>}
                      </th>
                      <th className="text-end">{nf(promotionTotalCount)}</th>
                      <th className="text-end">{nf(promotionTotalPrice)}</th>
                      <th className="text-end">
                        {totalCount > 0 && <>{round2((promotionTotalCount / totalCount) * 100)}%</>}
                        <br />
                        {/* legacy: 프로모션 금액비율 앞 `((` 이중 괄호 오타 이식 */}
                        {totalPrice > 0 && (
                          <>(({round2((promotionTotalPrice / totalPrice) * 100)}%)</>
                        )}
                      </th>
                      <th className="text-end">{nf(totalCount)}</th>
                      <th className="text-end">{nf(totalPrice)}</th>
                      <th></th>
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
