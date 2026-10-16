import {
  useStatOrderPublisherCount,
  type StatOrderPublisherCountSearch,
  type StatPublisherRow,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_publisher_count";

const nf = (n: number) => n.toLocaleString("en-US");
// legacy round($x, digits) + echo: 반올림 후 후행 0 제거.
const round = (n: number, digits: number) => {
  const p = 10 ** digits;
  return String(Math.round(n * p) / p);
};
// 비율 셀: denom>0일 때만 값(legacy는 가드 없으나 행에 판매가 있어 denom>0, NaN 회피).
const ratio = (numer: number, denom: number, digits: number) =>
  denom > 0 ? round((numer * 100) / denom, digits) : "";

// legacy AdminGoods::getPublisherNameFallback — 현재명 → 예전DB명+badge → 코드.
const PublisherName = ({ row }: { row: StatPublisherRow }) => {
  if (row.publisher_name) return <>{row.publisher_name}</>;
  if (row.old_publisher_name) {
    return (
      <>
        {row.old_publisher_name} <span className="badge bg-warning text-dark">예전DB</span>
      </>
    );
  }
  return <>{row.supplier_code}</>;
};

// legacy statistics/order/order_publisher_count.php — 공급처별 주문통계(page_title "공급처별 주문통계").
export const StatisticsOrderPublisherCountScreen = (search: StatOrderPublisherCountSearch) => {
  const now = new Date();
  // legacy 14~15: search_year 미지정 시 date('Y').
  const year = search.search_year || String(now.getFullYear());
  const resolved: StatOrderPublisherCountSearch = { search_year: year };

  const { data } = useStatOrderPublisherCount(resolved);

  if (!data) {
    return null;
  }

  const { rows, grand_total_count: grandCount, grand_total_price: grandPrice } = data;

  // 연도 옵션 2013~현재.
  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);

  // tfoot 합계 누적 (legacy 199~203, result1 기준).
  let normalTotalCount = 0;
  let normalTotalPrice = 0;
  let promotionTotalCount = 0;
  let promotionTotalPrice = 0;
  for (const r of rows) {
    normalTotalCount += r.normal.total_count;
    normalTotalPrice += r.normal.total_price;
    promotionTotalCount += r.promotion.total_count;
    promotionTotalPrice += r.promotion.total_price;
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
                    주문분석
                  </a>
                </li>
                <li className="breadcrumb-item active">공급처별 주문통계</li>
              </ol>
            </div>
            <h4 className="page-title">공급처별 주문통계</h4>
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
                    <label htmlFor="search_year" className="col-sm-3 col-form-label me-2">
                      연도
                    </label>
                    <div className="col-sm-9">
                      <select
                        className="form-select"
                        id="search_year"
                        name="search_year"
                        defaultValue={year}
                      >
                        <option value="">연도</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="col-auto">
                    <button className="input-group-text btn-primary shadow-none" type="submit">
                      검색
                    </button>
                  </div>
                </div>
              </form>

              <div className="table-responsive">
                <table className="table table-bordered table-centered w-100 nowrap table-sm">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center" rowSpan={2}>
                        순위
                      </th>
                      <th className="text-center" rowSpan={2}>
                        퍼블리셔
                      </th>
                      <th className="text-center" colSpan={2}>
                        일반판매
                      </th>
                      <th className="text-center" colSpan={2}>
                        프로모션
                      </th>
                      <th className="text-center" colSpan={2}>
                        합계
                      </th>
                      <th className="text-center" style={{ width: "100px" }} rowSpan={2}>
                        주문건수비율
                      </th>
                      <th className="text-center" style={{ width: "150px" }} rowSpan={2}>
                        주문금액비율
                      </th>
                    </tr>
                    <tr>
                      <th className="text-center" style={{ width: "100px" }}>
                        주문건수
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        주문금액
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        주문건수
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        주문금액
                      </th>
                      <th className="text-center" style={{ width: "100px" }}>
                        주문건수
                      </th>
                      <th className="text-center" style={{ width: "130px" }}>
                        주문금액
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-13">
                    {rows.map((row, index) => {
                      const countDenom = row.normal.total_count + row.promotion.total_count;
                      const priceDenom = row.normal.total_price + row.promotion.total_price;
                      return (
                        <tr key={row.supplier_code}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-start">
                            <PublisherName row={row} />
                          </td>
                          <td className="text-end">
                            {nf(row.normal.total_count)}
                            <br />({ratio(row.normal.total_count, countDenom, 2)}%)
                          </td>
                          <td className="text-end">
                            {nf(row.normal.total_price)}
                            <br />({ratio(row.normal.total_price, priceDenom, 2)}%)
                          </td>
                          <td className="text-end">
                            {nf(row.promotion.total_count)}
                            <br />({ratio(row.promotion.total_count, countDenom, 2)}%)
                          </td>
                          <td className="text-end">
                            {nf(row.promotion.total_price)}
                            <br />({ratio(row.promotion.total_price, priceDenom, 2)}%)
                          </td>
                          <td className="text-end">{nf(row.total_count)}</td>
                          <td className="text-end">{nf(row.total_price)}</td>
                          <td className="text-end">{ratio(row.total_count, grandCount, 2)}%</td>
                          <td className="text-end">{ratio(row.total_price, grandPrice, 4)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-dark">
                    <tr>
                      <th className="text-center" colSpan={2}>
                        합계
                      </th>
                      <th className="text-end">
                        {nf(normalTotalCount)}
                        <br />({ratio(normalTotalCount, grandCount, 2)}%)
                      </th>
                      <th className="text-end">
                        {nf(normalTotalPrice)}
                        <br />({ratio(normalTotalPrice, grandPrice, 2)}%)
                      </th>
                      <th className="text-end">
                        {nf(promotionTotalCount)}
                        <br />({ratio(promotionTotalCount, grandCount, 2)}%)
                      </th>
                      <th className="text-end">
                        {nf(promotionTotalPrice)}
                        <br />({ratio(promotionTotalPrice, grandPrice, 2)}%)
                      </th>
                      <th className="text-end">{nf(grandCount)}</th>
                      <th className="text-end">{nf(grandPrice)}</th>
                      <th className="text-end"></th>
                      <th className="text-end"></th>
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
    </>
  );
};
