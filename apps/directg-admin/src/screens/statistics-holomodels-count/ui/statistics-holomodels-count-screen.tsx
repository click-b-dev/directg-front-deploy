import {
  useStatHolomodelsCount,
  type StatHolomodelsCountSearch,
  type StatHolomodelsRow,
} from "@entities/statistics";

const BASE_URL = "/statistics/order/order_holomodels_count";

const nf = (n: number) => n.toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");

// legacy statistics/order/order_holomodels_count.php — 홀로 모델 주문현황.
export const StatisticsHolomodelsCountScreen = (search: StatHolomodelsCountSearch) => {
  const now = new Date();
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatHolomodelsCountSearch = { search_year: year, search_month: month };

  const { data } = useStatHolomodelsCount(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));
  const items = data?.items ?? [];

  let totalSalesCount = 0;
  let totalSalesAmount = 0;
  for (const row of items) {
    totalSalesCount += row.sales_count;
    totalSalesAmount += row.sales_amount;
  }

  return (
    <>
      {/* page title */}
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
                <li className="breadcrumb-item active">홀로 모델 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">홀로 모델 주문현황</h4>
          </div>
        </div>
      </div>

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body py-2">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-12">
                    <div className="row">
                      <label className="col-sm-1 col-form-label bg-light border">주문기간</label>
                      <div className="col-sm-3">
                        <div className="input-group">
                          <select
                            className="form-select me-2"
                            name="search_year"
                            defaultValue={year}
                          >
                            <option value="">:::년:::</option>
                            {years.map((y) => (
                              <option key={y} value={y}>
                                {y}년
                              </option>
                            ))}
                          </select>
                          <select className="form-select" name="search_month" defaultValue={month}>
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

      {/* 통계 요약 카드 */}
      {items.length > 0 && (
        <div className="row g-2 mb-2">
          <div className="col-md-3">
            <div className="card mb-0">
              <div className="card-body py-2 px-3">
                <p className="text-muted mb-1 font-13">총 상품 수</p>
                <h4 className="mb-0 num">
                  {nf(items.length)} <small className="text-muted fw-normal font-13">개</small>
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card mb-0">
              <div className="card-body py-2 px-3">
                <p className="text-muted mb-1 font-13">총 판매 수량</p>
                <h4 className="mb-0 num">
                  {nf(totalSalesCount)} <small className="text-muted fw-normal font-13">건</small>
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card mb-0">
              <div className="card-body py-2 px-3">
                <p className="text-muted mb-1 font-13">총 판매 금액</p>
                <h4 className="mb-0 num">
                  {nf(totalSalesAmount)} <small className="text-muted fw-normal font-13">원</small>
                </h4>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 결과 테이블 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-centered table-hover table-striped mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center" style={{ width: 50 }}>
                        No.
                      </th>
                      <th>상품코드</th>
                      <th>상품명</th>
                      <th className="text-end">판매 수량</th>
                      <th className="text-end">판매 금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          조회된 데이터가 없습니다.
                        </td>
                      </tr>
                    ) : (
                      items.map((row, index) => (
                        <StatHolomodelsRowView key={row.product_code} row={row} index={index} />
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="table-secondary fw-bold">
                      <tr>
                        <td colSpan={3} className="text-end">
                          합 계
                        </td>
                        <td className="text-end num">{nf(totalSalesCount)}</td>
                        <td className="text-end num">{nf(totalSalesAmount)}원</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatHolomodelsRowView = ({ row, index }: { row: StatHolomodelsRow; index: number }) => (
  <tr>
    <td className="text-center text-muted">{index + 1}</td>
    <td>
      <span>{row.product_code}</span>
    </td>
    <td>{row.product_name}</td>
    <td className="text-end num">{nf(row.sales_count)}</td>
    <td className="text-end num">{nf(row.sales_amount)}원</td>
  </tr>
);
