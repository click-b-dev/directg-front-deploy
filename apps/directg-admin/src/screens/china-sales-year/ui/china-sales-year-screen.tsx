import { useChinaSalesYear } from "@entities/china";

const BASE_URL = "/china/sales_china_year";

// legacy number_format(amount)." 원".
const won = (n: number) => `${n.toLocaleString("en-US")} 원`;
// legacy .zero-value { color:#C0C0C0 } — amount falsy(0) 시 회색.
const zeroStyle = (n: number) => (n ? undefined : { color: "#C0C0C0" });

// legacy china/sales_china_year.php — 중국 누적매출 현황(연도×지역 매트릭스, 읽기전용).
export const ChinaSalesYearScreen = () => {
  const { data } = useChinaSalesYear();

  if (!data) {
    return null;
  }

  const { regions, rows, region_totals, grand_total } = data;
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = 2016; y <= currentYear; y++) years.push(y);

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
                <li className="breadcrumb-item active">중국 누적매출 현황</li>
              </ol>
            </div>
            <h4 className="page-title">중국 누적매출 현황</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* legacy: 검색필터 카드는 d-none(숨김·dead) */}
      <div className="row d-none">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-6">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                      <div className="col-sm-3">
                        <select className="form-control" name="search_year" id="search_year">
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y} 년
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
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
                <th className="text-center">연도별 매출</th>
                {regions.map((name) => (
                  <th key={name} className="text-center">
                    {name}
                  </th>
                ))}
                <th className="text-center">합계</th>
              </tr>
            </thead>
            <tbody className="font-12 bg-white">
              {rows.map((row) => (
                <tr key={row.year}>
                  <td className="text-center">{row.year}년</td>
                  {row.amounts.map((amount, i) => (
                    <td key={i} className="text-end" style={zeroStyle(amount)}>
                      {won(amount)}
                    </td>
                  ))}
                  <td className="text-end" style={zeroStyle(row.total)}>
                    {won(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light font-13">
              <tr>
                <th className="text-center">누적 매출</th>
                {region_totals.map((total, i) => (
                  <th key={i} className="text-end" style={zeroStyle(total)}>
                    {won(total)}
                  </th>
                ))}
                <th className="text-end" style={zeroStyle(grand_total)}>
                  {won(grand_total)}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};
