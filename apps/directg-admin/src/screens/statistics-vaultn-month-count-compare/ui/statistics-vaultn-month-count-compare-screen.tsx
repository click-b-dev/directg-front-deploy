import {
  useStatVaultnMonthCompare,
  type StatVaultnMonthCompareRow,
  type StatVaultnMonthCompareSearch,
} from "@entities/statistics";
import { getOrderStatusLabel } from "@entities/order";

const BASE_URL = "/statistics/order/order_vaultn_month_count_compare";

const nf = (n: number) => n.toLocaleString("en-US");
const pad2 = (n: number) => String(n).padStart(2, "0");

// legacy statistics/order/order_vaultn_month_count_compare.php — VaultN 월별 주문현황(리포트 비교용).
export const StatisticsVaultnMonthCountCompareScreen = (search: StatVaultnMonthCompareSearch) => {
  const now = new Date();
  const publisher = search.search_publisher || "38";
  const year = search.search_year || String(now.getFullYear());
  const month = search.search_month || pad2(now.getMonth() + 1);
  const resolved: StatVaultnMonthCompareSearch = {
    search_publisher: publisher,
    search_year: year,
    search_month: month,
  };

  const { data } = useStatVaultnMonthCompare(resolved);

  const years: number[] = [];
  for (let y = 2013; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => pad2(i + 1));
  const items = data?.items ?? [];

  let orderCount = 0;
  let refundCount = 0;
  let etcCount = 0;
  for (const item of items) {
    orderCount++;
    if (item.status === "9") refundCount++;
    else if (item.status !== "2") etcCount++;
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
                    Vaultn 주문 분석
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 주문현황</li>
              </ol>
            </div>
            <h4 className="page-title">Vaultn 주문현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form className="align-items-center mb-3" action={BASE_URL} method="get">
                <div className="row g-2 align-items-center mb-2">
                  <div className="col-auto">
                    <label className="col-form-label">공급처</label>
                  </div>
                  <div className="col-auto">
                    <select
                      className="form-select"
                      id="search_publisher"
                      name="search_publisher"
                      defaultValue={publisher}
                    >
                      <option value=""></option>
                      <option value="38">Bethesda</option>
                      <option value="81">Funcom</option>
                    </select>
                  </div>
                </div>

                <div className="row g-2 align-items-center">
                  <div className="col-auto">
                    <label className="col-form-label">주문날짜</label>
                  </div>
                  <div className="col-auto">
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
                  <div className="col-auto">
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
                  <div className="col-auto">
                    <button className="btn btn-primary" type="submit">
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
                  <th className="text-center">주문일</th>
                  <th className="text-center">상품번호</th>
                  <th className="text-center">SKU</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">주문번호</th>
                  <th className="text-center">주문상태</th>
                  <th className="text-center">VaultN 상태</th>
                  <th className="text-center">API 전송날짜</th>
                </tr>
              </thead>
              <tbody className="font-12 bg-white">
                {items.map((row) => (
                  <StatVaultnMonthCompareRowView key={row.ordno} row={row} />
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <th colSpan={7} className="text-start">
                    VaultN의 기준시간은 UTC시간이므로 우리 주문에 맞추기 위해 UTC+9 사용
                    <br />
                    <br />
                    주문은 해당 달에 발생한 총 주문수량
                    <br />
                    DG통계가 더 많은 경우는 해외IP로 주문해서 VaultN에서는 주문실패한 경우, VaultN이
                    아닌 다른 경로로 판매된 경우
                    <br />
                    <br />
                    취소 수는 해당 달에 발생한 주문중에서 취소된 수량
                    <br />
                    지난달에 발생한 주문을 취소한 경우에 일치하지 않음
                  </th>
                  <th className="text-end">
                    주문 : {nf(orderCount)}
                    <br />
                    취소 : {nf(refundCount)}
                    <br />
                    기타 : {nf(etcCount)}
                    <br />
                    합계 : {nf(orderCount - refundCount - etcCount)}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        {/* end col */}
      </div>
      {/* end row */}
    </>
  );
};

const StatVaultnMonthCompareRowView = ({ row }: { row: StatVaultnMonthCompareRow }) => {
  const textColor = row.status !== "2" ? "text-danger" : "";
  const bgColor = row.vaultn_status !== "Completed" ? "bg-warning" : "";
  const cellClass = `${textColor} ${bgColor}`;

  return (
    <tr>
      <td className={`text-center ${cellClass}`}>{row.order_date}</td>
      <td className={`text-center ${cellClass}`}>{row.product_code}</td>
      <td className={`text-center ${cellClass}`}>{row.sku}</td>
      <td className={cellClass}>{row.product_name}</td>
      <td className={`text-center ${cellClass}`}>{row.ordno}</td>
      <td className={`text-center ${cellClass}`}>{getOrderStatusLabel(row.status)}</td>
      <td className={`text-center ${cellClass}`}>{row.vaultn_status}</td>
      <td className={`text-center ${cellClass}`}>
        {row.reg_date}
        <br />
      </td>
    </tr>
  );
};
