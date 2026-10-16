import {
  useStatOrderMonthCount,
  type StatOrderMonthCountSearch,
  type StatOrderMonthItem,
  type StatOrderDaySalesBucket,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_month_count";

const nf = (n: number) => n.toLocaleString("en-US");
// legacy round($x, 2) + echo: 소수 둘째자리 반올림, 후행 0 제거.
const round2 = (n: number) => String(Math.round(n * 100) / 100);
const pad2 = (n: number) => String(n).padStart(2, "0");

const ZERO_BUCKET: StatOrderDaySalesBucket = { total_count: 0, total_price: 0 };

// legacy statistics/order/order_month_count.php — 월별 주문집계(page_title "월별 주문현황", 읽기전용).
export const StatisticsOrderMonthCountScreen = (search: StatOrderMonthCountSearch) => {
  const now = new Date();
  // legacy 15~17: search_year 미지정 시 date('Y'). search_month는 폼에 없음(dead).
  const year = search.search_year || String(now.getFullYear());
  const resolved: StatOrderMonthCountSearch = { search_year: year };

  const { data } = useStatOrderMonthCount(resolved);

  if (!data) {
    return null;
  }

  // sparse months → order_month 조회 맵.
  const byMonth = new Map<string, StatOrderMonthItem>();
  for (const m of data.months) byMonth.set(m.order_month, m);

  // 연도 옵션 2013~현재년 (legacy 99~103).
  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);

  // tfoot 합계 누적 (legacy 154~164). 예약 합계는 미출력(주석) → 계산 생략.
  let normalTotalCount = 0;
  let normalTotalPrice = 0;
  let promotionTotalCount = 0;
  let promotionTotalPrice = 0;
  let totalCount = 0;
  let totalPrice = 0;

  type Row = {
    orderMonth: string;
    preorder: StatOrderDaySalesBucket;
    normal: StatOrderDaySalesBucket;
    promotion: StatOrderDaySalesBucket;
    total_count: number;
    total_price: number;
  };
  const rows: Row[] = [];
  for (let mm = 1; mm <= 12; mm++) {
    const orderMonth = `${year}-${pad2(mm)}`;
    const item = byMonth.get(orderMonth);
    const preorder = item?.preorder ?? ZERO_BUCKET;
    const normal = item?.normal ?? ZERO_BUCKET;
    const promotion = item?.promotion ?? ZERO_BUCKET;
    const rowTotalCount = item?.total_count ?? 0;
    const rowTotalPrice = item?.total_price ?? 0;

    rows.push({
      orderMonth,
      preorder,
      normal,
      promotion,
      total_count: rowTotalCount,
      total_price: rowTotalPrice,
    });

    normalTotalCount += normal.total_count;
    normalTotalPrice += normal.total_price;
    promotionTotalCount += promotion.total_count;
    promotionTotalPrice += promotion.total_price;
    totalCount += rowTotalCount;
    totalPrice += rowTotalPrice;
  }

  // legacy 146~149: 셀 내부 `number_format<br/>(비율%)`. 값은 대상 metric>0일 때만, 항상 % 접미.
  const cell = (value: number, ratioNumer: number, ratioDenom: number) => (
    <>
      {nf(value)}
      <br />({value > 0 ? round2((ratioNumer * 100) / ratioDenom) : ""}%)
    </>
  );

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
                <li className="breadcrumb-item active">월별 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">월별 주문현황</h4>
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
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" rowSpan={2}>
                        날짜
                      </th>
                      <th className="text-center" colSpan={2}>
                        예약판매
                      </th>
                      <th className="text-center" colSpan={2}>
                        일반판매
                      </th>
                      <th className="text-center" colSpan={2}>
                        프로모션판매
                      </th>
                      <th className="text-center" colSpan={2}>
                        합계
                      </th>
                    </tr>
                    <tr>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                      <th className="text-center">주문건수</th>
                      <th className="text-center">주문합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.orderMonth}>
                        <td className="text-end">{row.orderMonth}</td>
                        <td className="text-end">{nf(row.preorder.total_count)}</td>
                        <td className="text-end">{nf(row.preorder.total_price)}</td>
                        <td className="text-end">
                          {cell(row.normal.total_count, row.normal.total_count, row.total_count)}
                        </td>
                        <td className="text-end">
                          {cell(row.normal.total_price, row.normal.total_price, row.total_price)}
                        </td>
                        <td className="text-end">
                          {cell(
                            row.promotion.total_count,
                            row.promotion.total_count,
                            row.total_count,
                          )}
                        </td>
                        <td className="text-end">
                          {cell(
                            row.promotion.total_price,
                            row.promotion.total_price,
                            row.total_price,
                          )}
                        </td>
                        <td className="text-end">{nf(row.total_count)}</td>
                        <td className="text-end">{nf(row.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <th className="text-center">합계</th>
                      {/* legacy: 예약 건수·합계 셀 주석처리 → 빈칸 */}
                      <th className="text-end"></th>
                      <th className="text-end"></th>
                      <th className="text-end">
                        {nf(normalTotalCount)}
                        <br />({totalCount > 0 ? round2((normalTotalCount / totalCount) * 100) : ""}
                        %)
                      </th>
                      <th className="text-end">
                        {nf(normalTotalPrice)}
                        <br />({totalPrice > 0 ? round2((normalTotalPrice / totalPrice) * 100) : ""}
                        %)
                      </th>
                      <th className="text-end">
                        {nf(promotionTotalCount)}
                        <br />(
                        {totalCount > 0 ? round2((promotionTotalCount / totalCount) * 100) : ""}%)
                      </th>
                      <th className="text-end">
                        {nf(promotionTotalPrice)}
                        <br />(
                        {totalPrice > 0 ? round2((promotionTotalPrice / totalPrice) * 100) : ""}%)
                      </th>
                      <th className="text-end">{nf(totalCount)}</th>
                      <th className="text-end">{nf(totalPrice)}</th>
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
