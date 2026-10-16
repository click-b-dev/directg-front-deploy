import { Fragment } from "react";
import { useChinaOrderMonth, type ChinaOrderMonthSearch } from "@entities/china";
import { env } from "@shared/config/env";

const BASE_URL = "/china/order_china_month";

const nf = (n: number) => n.toLocaleString("en-US");
// legacy .zero-value { color:#C0C0C0 } — 값 falsy(0) 시 회색.
const zeroStyle = (n: number) => (n ? undefined : { color: "#C0C0C0" });

// legacy china/order_china_month.php — 중국 월별주문 현황(타이틀별 × 지역별, 읽기전용).
export const ChinaOrderMonthScreen = (search: ChinaOrderMonthSearch) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  // legacy 19~25: 미지정 시 현재년/현재월(date('n')) 기본.
  const year = search.search_year || String(currentYear);
  const month = search.search_month || String(currentMonth);
  const { data } = useChinaOrderMonth({ search_year: year, search_month: month });

  const years: number[] = [];
  for (let y = 2016; y <= currentYear; y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  if (!data) {
    return null;
  }

  const { regions, titles, region_totals, total_all_qty, total_all_amount } = data;

  // legacy CSV(mode=excel): 백엔드 .xls 생성. 검증(total_results>0)은 주석 dead → 항상 다운로드.
  const onExcelDownload = () => {
    window.location.href = `${env.apiBaseUrl}/admin/china/orders/month/excel?search_year=${year}&search_month=${month}`;
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
                    중국 결제
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    중국 결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">중국 월별주문 현황</li>
              </ol>
            </div>
            <h4 className="page-title">중국 월별주문 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 — 연도/월 select(onchange auto-submit), submit 버튼 d-none */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">기간</label>
                      <div className="col-sm-2">
                        <select
                          className="form-control"
                          name="search_year"
                          id="search_year"
                          defaultValue={year}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        >
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y} 년
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-2 ps-0">
                        <select
                          className="form-control"
                          name="search_month"
                          id="search_month"
                          defaultValue={month}
                          onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        >
                          {months.map((m) => (
                            <option key={m} value={m}>
                              {m} 월
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row d-none">
                  <div className="col-lg-12">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table table-hover table-centered w-100 nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">
                  {year}년 {month}월
                </th>
                <th className="text-center" rowSpan={2}>
                  플랫폼
                </th>
                <th className="text-center" rowSpan={2}>
                  단가
                </th>
                {regions.map((name) => (
                  <th key={name} className="text-center" colSpan={2}>
                    {name}
                  </th>
                ))}
                <th className="text-center" colSpan={2}>
                  전체 합계
                </th>
              </tr>
              <tr>
                <th className="text-center">타이틀별</th>
                {regions.map((name) => (
                  <Fragment key={name}>
                    <th className="text-center">수량</th>
                    <th className="text-center">금액</th>
                  </Fragment>
                ))}
                <th className="text-center">수량</th>
                <th className="text-center">합계 금액</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {titles.map((title, ti) => (
                <tr key={ti}>
                  <td className="text-center">{title.product_nm}</td>
                  <td className="text-center">{title.platform}</td>
                  <td className="text-end">{nf(title.price)}</td>
                  {title.cells.map((cell, ci) => (
                    <Fragment key={ci}>
                      <td className="text-end" style={zeroStyle(cell.qty)}>
                        {nf(cell.qty)}
                      </td>
                      <td className="text-end" style={zeroStyle(cell.amount)}>
                        {nf(cell.amount)}
                      </td>
                    </Fragment>
                  ))}
                  <td className="text-end" style={zeroStyle(title.row_qty)}>
                    {nf(title.row_qty)}
                  </td>
                  <td className="text-end" style={zeroStyle(title.row_amount)}>
                    {nf(title.row_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light font-13">
              <tr>
                <th className="text-center" colSpan={3}>
                  총합계
                </th>
                {region_totals.map((total, i) => (
                  <Fragment key={i}>
                    <th className="text-end" style={zeroStyle(total.qty)}>
                      {nf(total.qty)}
                    </th>
                    <th className="text-end" style={zeroStyle(total.amount)}>
                      {nf(total.amount)}
                    </th>
                  </Fragment>
                ))}
                <th className="text-end" style={zeroStyle(total_all_qty)}>
                  {nf(total_all_qty)}
                </th>
                <th className="text-end" style={zeroStyle(total_all_amount)}>
                  {`${nf(total_all_amount)} 원`}
                </th>
              </tr>
            </tfoot>
          </table>

          <div className="mb-2">
            <button
              type="button"
              className="btn btn-light shadow-none border"
              onClick={onExcelDownload}
            >
              <i className="mdi mdi-microsoft-excel font-16"></i> CSV 다운로드
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
