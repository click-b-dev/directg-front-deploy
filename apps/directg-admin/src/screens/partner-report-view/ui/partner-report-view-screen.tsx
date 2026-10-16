import { usePartnerReportView, type PartnerReportViewSearch } from "@entities/partner";

const nf0 = (n: number) => Math.round(n).toLocaleString("en-US");
const nf2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy 분기 범위 맵(4분기 "010.01" 오타 그대로).
const QUARTER: Record<string, string> = {
  "1": "01.01~03.31",
  "2": "04.01~06.30",
  "3": "07.01~09.30",
  "4": "010.01~12.31",
};

// legacy pc/_Admin_/partner/report_view.php — 리포트 상세보기(read-only).
export const PartnerReportViewScreen = (search: PartnerReportViewSearch) => {
  const { data } = usePartnerReportView(search.idx);

  if (!data) {
    return null;
  }

  const { config, items } = data;

  // legacy Period: 월별 = {y}.{m}.01~{m}.{말일}, 분기별 = {y}Q{m} ({범위}).
  const lastDay = new Date(Number(config.report_year), Number(config.report_month), 0).getDate();
  const period =
    config.report_term === "T"
      ? `${config.report_year}Q${config.report_month} (${QUARTER[config.report_month] ?? ""})`
      : `${config.report_year}.${config.report_month}.01~${config.report_month}.${lastDay}`;

  const totals = items.reduce(
    (acc, v) => ({
      grossUnitsSold: acc.grossUnitsSold + v.gross_units_sold,
      grossSalesExVat: acc.grossSalesExVat + v.gross_sales_ex_vat,
      paymentGatewayFee: acc.paymentGatewayFee + v.payment_gateway_fee,
      netSales: acc.netSales + v.net_sales,
      revenueShare: acc.revenueShare + v.revenue_share,
    }),
    { grossUnitsSold: 0, grossSalesExVat: 0, paymentGatewayFee: 0, netSales: 0, revenueShare: 0 },
  );

  const royaltyPayable = totals.revenueShare * config.royalty;

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
                    파트너
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    리포트 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">리포트 상세보기</li>
              </ol>
            </div>
            <h4 className="page-title">리포트 상세보기</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {/* Invoice Logo */}
              <div className="clearfix">
                <div className="float-start mb-2">
                  <h4 className="m-0 d-print-none">Product Statistics - {config.publisher}</h4>
                </div>
              </div>

              {/* Invoice Detail */}
              <div className="row">
                <div className="col-sm-6">
                  <div className="mt-0">
                    <ol className="list-group list-group-numbered border-0">
                      <li className="list-group-item border-0 py-1">Period: {period}</li>
                      <li className="list-group-item border-0 py-1">
                        Royalty: KRW 1-&gt; {config.currency_converter} {config.royalty} (
                        {config.royalty_info})
                      </li>
                      <li className="list-group-item border-0 py-1">Default currency: KRW</li>
                      <li className="list-group-item border-0 py-1">Revenue Share: </li>
                      <li className="list-group-item border-0 py-1">
                        Payment Gateway Fee: Bank Transfer - {config.account_fee} %, Credit Card -{" "}
                        {config.card_fee} %, Mobile Payment - {config.mobile_fee} %
                      </li>
                    </ol>
                  </div>
                </div>
                {/* end col */}
                <div className="col-sm-4 offset-sm-2">
                  <div className="float-sm-end">
                    <div className="d-grid mb-2">
                      {/* legacy: JS 핸들러 없음(dead) — 렌더만, 무동작 */}
                      <button
                        type="button"
                        className="btn btn-sm btn-info shadow-none"
                        id="btn_email_notice"
                        data-idx={config.idx}
                        data-publisher={config.publisher_code}
                        data-year={config.report_year}
                        data-month={config.report_month}
                      >
                        알림메일발송
                      </button>
                    </div>
                    <p className="font-12 mb-1">
                      <strong>리포트 생성일: </strong> {config.reg_date}
                    </p>
                    <p className="font-12 mb-1">
                      <strong>리포트 수정일: </strong> {config.update_date}
                    </p>
                    <p className="font-12 mb-1">
                      <strong>알림메일 발송일: </strong> {config.notice_date}
                    </p>
                    <p className="font-12 mb-1">
                      <strong>리포트 승인일: </strong> {config.approval_date}
                    </p>
                    <p className="font-12 mb-1">
                      <strong>진행상태: </strong>{" "}
                      <span className="badge bg-success font-12">{config.status}</span>
                    </p>
                  </div>
                </div>
                {/* end col */}
              </div>
              {/* end row */}

              <div className="row">
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm table-centered mt-2">
                      <thead className="table-light">
                        <tr>
                          <th className="text-center">Platform</th>
                          <th className="text-center">Product</th>
                          <th className="text-center">
                            SRP
                            <br />
                            (KRW)
                          </th>
                          <th className="text-center">Rate</th>
                          <th className="text-center">
                            Price
                            <br />
                            (KRW)
                          </th>
                          <th className="text-center">
                            Product Cost
                            <br />
                            (KRW)
                          </th>
                          <th className="text-center">
                            Payment
                            <br />
                            Gateway
                          </th>
                          <th className="text-center">Units Sold</th>
                          <th className="text-center">
                            Gross Sales
                            <br />
                            (KRW)
                          </th>
                          <th className="text-center">PG Fee</th>
                          <th className="text-center">
                            Net Sales
                            <br />
                            (KRW)
                          </th>
                          <th className="text-center">
                            Revenue Share
                            <br />
                            (KRW)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-12">
                        {items.map((value, i) => {
                          // legacy: rate=="0"→product_cost, else product_cost*(1-rate/100).
                          const productCost =
                            value.rate === "0"
                              ? value.product_cost
                              : value.product_cost * (1 - Number(value.rate) / 100);
                          return (
                            <tr key={i}>
                              <td className="text-center">{value.platform}</td>
                              <td>{value.product_nm_en}</td>
                              <td className="text-end">{nf0(value.publisher_srp)}</td>
                              <td className="text-center">{value.rate} %</td>
                              <td className="text-end">{nf0(value.publisher_price)}</td>
                              <td className="text-end">{nf0(productCost)}</td>
                              <td className="text-center">{value.payment_gateway}</td>
                              <td className="text-end">{nf0(value.gross_units_sold)}</td>
                              <td className="text-end">{nf0(value.gross_sales_ex_vat)}</td>
                              <td className="text-end">{nf0(value.payment_gateway_fee)}</td>
                              <td className="text-end">{nf0(value.net_sales)}</td>
                              <td className="text-end">{nf0(value.revenue_share)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colSpan={7}></th>
                          <th className="text-end">{nf0(totals.grossUnitsSold)}</th>
                          <th className="text-end">{nf0(totals.grossSalesExVat)}</th>
                          <th className="text-end">{nf0(totals.paymentGatewayFee)}</th>
                          <th className="text-end">{nf0(totals.netSales)}</th>
                          <th className="text-end">{nf0(totals.revenueShare)}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              {/* end row */}

              <div className="row">
                <div className="col-sm-6">
                  <div className="clearfix pt-3"></div>
                </div>
                <div className="col-sm-6">
                  <div className="float-end mt-3 mt-sm-0">
                    <h4>
                      Royalty Payable: {config.currency_converter} {nf2(royaltyPayable)}{" "}
                    </h4>
                  </div>
                  <div className="clearfix"></div>
                </div>
              </div>
              {/* end row */}

              <div className="d-print-none mt-4">
                <div className="float-start">
                  <a href="/partner/report_list" className="btn btn-secondary shadow-none">
                    목록가기
                  </a>
                </div>
                <div className="float-end"></div>
              </div>
              {/* end buttons */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
