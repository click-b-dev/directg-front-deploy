import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePartnerReportPreview,
  usePartnerListAll,
  useCreatePartnerReport,
  useEditPartnerRevenue,
  useSyncPartnerSales,
  useSyncPartnerRefund,
  partnerReportPreviewQueryKey,
  type PartnerReportSearch,
  type PartnerReportLine,
} from "@entities/partner";
import { computeReportRows, sumReportTotals, type ReportFees } from "../lib/calc";

const BASE_URL = "/partner/report_register";

const nf0 = (n: number) => Math.round(n).toLocaleString("en-US");
const nf2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy uncomma() — 숫자/선행 마이너스만 남김.
const uncomma = (str: string) => {
  const s = String(str);
  const minus = s.charAt(0) === "-" ? "-" : "";
  return minus + s.replace(/[^\d]+/g, "");
};

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const PREV_MONTH = now.getMonth() === 0 ? 12 : now.getMonth();
// legacy: search_year 미지정 시 전월==12면 연도-1(search_flag=false 조건).
const DEFAULT_YEAR = String(PREV_MONTH === 12 ? CURRENT_YEAR - 1 : CURRENT_YEAR);
const DEFAULT_MONTH = String(PREV_MONTH).padStart(2, "0");
const DEFAULT_MONTH_TERM = String(Math.ceil((now.getMonth() + 1) / 3));

type EditField = { balence: string; goodsSrp: string; orderSrp: string; revenue: string };

// legacy pc/_Admin_/partner/report_register.php — 리포트 생성(정산 미리보기 + 생성).
export const PartnerReportRegisterScreen = (search: PartnerReportSearch) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 확정 조회 조건(URL search).
  const confReportTerm = search.search_report_term || "M";
  const confYear = search.search_year || DEFAULT_YEAR;
  const confMonth =
    confReportTerm === "M"
      ? search.search_month || DEFAULT_MONTH
      : search.search_month_term || DEFAULT_MONTH_TERM;
  const confPublisher = search.publisher_code;

  const { data } = usePartnerReportPreview({
    publisher_code: confPublisher,
    report_term: confReportTerm,
    year: confYear,
    month: confMonth,
  });
  const { data: partners } = usePartnerListAll();

  const createMutation = useCreatePartnerReport();
  const editMutation = useEditPartnerRevenue();
  const salesSyncMutation = useSyncPartnerSales();
  const refundSyncMutation = useSyncPartnerRefund();

  // 편집중 폼 상태(초기값 = 확정 조건).
  const [reportTerm, setReportTerm] = useState(confReportTerm);
  const [year, setYear] = useState(confYear);
  const [month, setMonth] = useState(confReportTerm === "M" ? confMonth : DEFAULT_MONTH);
  const [monthTerm, setMonthTerm] = useState(
    confReportTerm === "T" ? confMonth : DEFAULT_MONTH_TERM,
  );
  const [publisherCode, setPublisherCode] = useState(confPublisher);
  const [currencyConverter, setCurrencyConverter] = useState(search.currency_converter || "USD");
  const [royalty, setRoyalty] = useState(search.royalty);
  const [royaltyInfo, setRoyaltyInfo] = useState(search.royalty_info);
  const [accountFee, setAccountFee] = useState(search.account_fee);
  const [cardFee, setCardFee] = useState(search.card_fee);
  const [mobileFee, setMobileFee] = useState(search.mobile_fee);

  const [fields, setFields] = useState<EditField[]>([]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const pgFee = data?.pg_fee ?? null;

  // legacy: getPartnerPGFee truthy면 결제수수료 폼값 override(사용자 값보다 우선).
  useEffect(() => {
    if (!pgFee) {
      return;
    }
    if (pgFee.account) setAccountFee(pgFee.account);
    if (pgFee.credit_card) setCardFee(pgFee.credit_card);
    if (pgFee.mobile_payment) setMobileFee(pgFee.mobile_payment);
  }, [pgFee]);

  // preview 갱신 시 행 편집필드 초기화(goodsSrp=product_srp, orderSrp=order_srp, revenue=product_rs).
  useEffect(() => {
    setFields(
      items.map((it) => ({
        balence: "",
        goodsSrp: nf0(it.product_srp),
        orderSrp: nf0(it.order_srp),
        revenue: it.product_rs,
      })),
    );
  }, [items]);

  const years: number[] = [];
  for (let y = 2020; y <= CURRENT_YEAR; y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const fees: ReportFees = {
    account: Number(accountFee) || 0,
    card: Number(cardFee) || 0,
    mobile: Number(mobileFee) || 0,
  };
  const rows = computeReportRows(items, fees);
  const totals = sumReportTotals(rows);
  const royaltyPayable = totals.revenueShare * (Number(royalty) || 0);

  // legacy: report_term=="M" && publisher && year && month → 동기화 버튼 노출.
  const showSyncBtn = confReportTerm === "M" && !!confPublisher && !!confYear && !!confMonth;

  const setField = (index: number, key: keyof EditField, value: string) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  };

  const onPreview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({
      to: BASE_URL,
      search: {
        publisher_code: publisherCode,
        search_report_term: reportTerm,
        search_year: year,
        search_month: reportTerm === "M" ? month : "",
        search_month_term: reportTerm === "T" ? monthTerm : "",
        currency_converter: currencyConverter,
        account_fee: accountFee,
        card_fee: cardFee,
        mobile_fee: mobileFee,
        royalty,
        royalty_info: royaltyInfo,
      },
    });
  };

  // legacy btn_report: 각 행 수집 → POST report_register → report_list 이동.
  const onGenerate = () => {
    const reportData: PartnerReportLine[] = rows.map((r, i) => {
      const f = fields[i];
      return {
        product_code: r.item.product_code,
        product_nm_en: r.item.product_name_en,
        platform_code: String(r.item.product_platform),
        balence: f?.balence ?? "",
        rate: r.rate,
        payment_gateway: r.item.settlekind,
        publisher_srp: uncomma(f?.goodsSrp ?? ""),
        sales_price: String(r.item.price),
        publisher_price: uncomma(f?.orderSrp ?? ""),
        product_cost: String(r.item.product_ppr),
        gross_units_sold: String(r.item.cc),
        gross_sales_in_vat: String(r.grossInVat),
        gross_sales_ex_vat: String(r.grossExVat),
        payment_gateway_fee: String(r.paymentFee),
        net_sales: String(r.netSales),
        revenue: f?.revenue ?? "",
        revenue_share: String(r.revenueShare),
      };
    });
    const reportMonth = reportTerm === "T" ? monthTerm : month;
    createMutation.mutate(
      {
        publisher_code: publisherCode,
        report_term: reportTerm,
        currency_converter: currencyConverter,
        account_fee: accountFee,
        card_fee: cardFee,
        mobile_fee: mobileFee,
        royalty,
        royalty_info: royaltyInfo,
        search_year: year,
        search_month: reportMonth,
        report_data: reportData,
      },
      {
        // legacy go(report_list.php) — 리포트 내역으로 이동(#261).
        onSuccess: () => {
          window.location.href = "/partner/report_list";
        },
      },
    );
  };

  // legacy 동기화(report_register 화면): 성공 시 location.reload() = 미리보기 invalidate.
  const invalidatePreview = () =>
    queryClient.invalidateQueries({
      queryKey: partnerReportPreviewQueryKey({
        publisher_code: confPublisher,
        report_term: confReportTerm,
        year: confYear,
        month: confMonth,
      }),
    });

  const onSalesSync = () => {
    if (!publisherCode) {
      window.alert("파트너를 선택하세요.");
      return;
    }
    salesSyncMutation.mutate(
      { publisher_code: Number(publisherCode), year, month },
      { onSuccess: invalidatePreview },
    );
  };

  const onRefundSync = () => {
    if (!publisherCode) {
      window.alert("퍼블리셔를 선택하세요.");
      return;
    }
    refundSyncMutation.mutate(
      { publisher_code: Number(publisherCode), year, month },
      { onSuccess: invalidatePreview },
    );
  };

  const onEdit = (index: number) => {
    const f = fields[index];
    const it = items[index];
    if (!f || !it) {
      return;
    }
    editMutation.mutate({
      product_code: it.product_code,
      revenue: f.revenue,
      goods_srp: uncomma(f.goodsSrp),
      publisher_price: uncomma(f.orderSrp),
      sales_price: String(it.price),
    });
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
                    파트너
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    리포트 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">리포트 생성</li>
              </ol>
            </div>
            <h4 className="page-title">리포트 생성</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" onSubmit={onPreview}>
              <div className="row mb-2">
                <div className="col-3">
                  <div className="row">
                    <label className="col-sm-4 col-form-label-sm bg-light border font-14 px-1">
                      리포트 주기
                    </label>
                    <div className="col-sm-8">
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id="search_report_term_m"
                          name="search_report_term"
                          className="form-check-input"
                          value="M"
                          checked={reportTerm === "M"}
                          onChange={() => setReportTerm("M")}
                        />
                        <label className="form-check-label font-14" htmlFor="search_report_term_m">
                          월별
                        </label>
                      </div>
                      <div className="form-check form-check-inline mt-1">
                        <input
                          type="radio"
                          id="search_report_term_t"
                          name="search_report_term"
                          className="form-check-input"
                          value="T"
                          checked={reportTerm === "T"}
                          onChange={() => setReportTerm("T")}
                        />
                        <label className="form-check-label font-14" htmlFor="search_report_term_t">
                          분기별
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-9">
                  <div className="row">
                    <label className="col-sm-1 col-form-label-sm bg-light border font-14 px-1">
                      기간검색
                    </label>
                    <div className="col-sm-2">
                      <select
                        className="form-select"
                        id="search_year"
                        name="search_year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      >
                        <option value="">:::년도:::</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}년
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-sm-9">
                      <div className="input-group">
                        <div
                          id="choice_month"
                          style={{ display: reportTerm === "M" ? "" : "none" }}
                        >
                          {months.map((m) => {
                            const mm = String(m).padStart(2, "0");
                            return (
                              <span key={m}>
                                <input
                                  type="radio"
                                  className="btn-check"
                                  name="search_month"
                                  id={`search_month_${m}`}
                                  value={mm}
                                  autoComplete="off"
                                  checked={month === mm}
                                  onChange={(e) => setMonth(e.target.value)}
                                />
                                <label
                                  className="btn btn-sm btn-outline-secondary shadow-none font-14"
                                  htmlFor={`search_month_${m}`}
                                >
                                  {mm}월
                                </label>
                              </span>
                            );
                          })}
                        </div>
                        <div
                          id="choice_month_term"
                          style={{ display: reportTerm === "T" ? "" : "none" }}
                        >
                          {quarters.map((q) => (
                            <span key={q}>
                              <input
                                type="radio"
                                className="btn-check"
                                name="search_month_term"
                                id={`search_month_term_${q}`}
                                value={q}
                                autoComplete="off"
                                checked={monthTerm === String(q)}
                                onChange={(e) => setMonthTerm(e.target.value)}
                              />
                              <label
                                className="btn btn-sm btn-outline-secondary shadow-none font-14"
                                htmlFor={`search_month_term_${q}`}
                              >
                                {q}분기
                              </label>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-4">
                  <div className="row">
                    <label
                      htmlFor="publisher_code"
                      className="col-sm-3 col-form-label-sm bg-light border font-14 px-1"
                    >
                      파트너
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="publisher_code"
                        name="publisher_code"
                        className="form-select"
                        value={publisherCode}
                        onChange={(e) => setPublisherCode(e.target.value)}
                      >
                        <option value="">:::파트너 선택:::</option>
                        {(partners ?? []).map((p) => (
                          <option key={p.publisher_code} value={p.publisher_code}>
                            {p.publisher_name} / {p.report_term === "T" ? "Quarterly" : "Monthly"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-6">
                  <div className="row">
                    <label
                      htmlFor="currency_converter"
                      className="col-sm-2 col-form-label-sm bg-light border font-14 px-1"
                    >
                      환율설정
                    </label>
                    <div className="col-sm-10">
                      <div className="input-group row">
                        <div className="col-4">
                          <select
                            className="form-select"
                            name="currency_converter"
                            id="currency_converter"
                            value={currencyConverter}
                            onChange={(e) => setCurrencyConverter(e.target.value)}
                          >
                            <option value="USD">KRW 1 =&gt; USD</option>
                            <option value="EUR">KRW 1 =&gt; EUR</option>
                            <option value="JPY">KRW 1 =&gt; JPY</option>
                          </select>
                        </div>
                        <div className="col-4">
                          <input
                            type="text"
                            name="royalty"
                            id="royalty"
                            className="form-control"
                            value={royalty}
                            onChange={(e) => setRoyalty(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="row">
                    <label
                      htmlFor="royalty_info"
                      className="col-sm-2 col-form-label-sm bg-light border font-14 px-1"
                    >
                      환율기준참조
                    </label>
                    <div className="col-sm-4">
                      <input
                        type="text"
                        name="royalty_info"
                        id="royalty_info"
                        className="form-control"
                        value={royaltyInfo}
                        onChange={(e) => setRoyaltyInfo(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-12">
                  <div className="row">
                    <label className="col-sm-1 col-form-label-sm bg-light border font-14 px-1">
                      결제수수료
                    </label>
                    <div className="col-sm-6">
                      <div className="row">
                        <div className="col-4">
                          <div className="input-group">
                            <div className="input-group-text font-14">Account</div>
                            <input
                              type="text"
                              name="account_fee"
                              id="account_fee"
                              className="form-control"
                              value={accountFee}
                              onChange={(e) => setAccountFee(e.target.value)}
                            />
                            <div className="input-group-text">%</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="input-group">
                            <div className="input-group-text font-14">Credit Card</div>
                            <input
                              type="text"
                              name="card_fee"
                              id="card_fee"
                              className="form-control"
                              value={cardFee}
                              onChange={(e) => setCardFee(e.target.value)}
                            />
                            <div className="input-group-text">%</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="input-group">
                            <div className="input-group-text font-14">Mobile Payment</div>
                            <input
                              type="text"
                              name="mobile_fee"
                              id="mobile_fee"
                              className="form-control"
                              value={mobileFee}
                              onChange={(e) => setMobileFee(e.target.value)}
                            />
                            <div className="input-group-text">%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 text-center">
                  <button type="submit" className="btn btn-secondary shadow-none">
                    리포트 미리보기
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="d-flex">
          {showSyncBtn && (
            <>
              <div>
                <button
                  type="button"
                  className="btn btn-primary shadow-none border"
                  onClick={onSalesSync}
                >
                  Sales list 동기화
                </button>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-primary shadow-none border"
                  onClick={onRefundSync}
                >
                  Refund list 동기화
                </button>
              </div>
            </>
          )}
        </div>
        <div className="float-end">
          <button type="button" className="btn btn-primary shadow-none border" onClick={onGenerate}>
            리포트 생성
          </button>
        </div>
      </div>

      <div className="row g-2">
        <div className="col-12">
          <div className="table-responsive statistics-board mgt0" id="excelData">
            <table className="table table-rows table-bordered table-centered" id="listTable">
              <colgroup>
                <col width="5%" />
                <col width="*" />
                <col width="6%" />
                <col width="4%" />
                <col width="5%" />
                <col width="7%" />
                <col width="5%" />
                <col width="7%" />
                <col width="5%" />
                <col width="5%" />
                <col width="5%" />
                <col width="5%" />
                <col width="5%" />
                <col width="7%" />
                <col width="5%" />
                <col width="5%" />
              </colgroup>
              <thead className="table-light font-13">
                <tr className="nowrap text-center">
                  <th className="bln">ITEM_ID</th>
                  <th className="point1-line">Product</th>
                  <th className="point1-line">
                    Balence
                    <br />
                    (%)
                  </th>
                  <th className="point1-line">rate</th>
                  <th className="">
                    Payment <br />
                    Gateway
                  </th>
                  <th className="point1-line">
                    Publisher SRP
                    <br />
                    (KRW)
                  </th>
                  <th className="point1-line">
                    Sales Price
                    <br />
                    (KRW)
                  </th>
                  <th className="point1-line">
                    Publisher Price
                    <br />
                    (KRW)
                  </th>
                  <th className="point1-line">
                    Gross Units <br />
                    Sold
                  </th>
                  <th className="point1-line">
                    Gross Sales
                    <br />
                    (in VAT)
                  </th>
                  <th className="point1-line">
                    Gross Sales
                    <br />
                    (ex VAT)
                  </th>
                  <th className="point1-line">
                    Payment <br />
                    Gateway FEE
                  </th>
                  <th className="point1-line">
                    Net Sales
                    <br />
                    (KRW)
                  </th>
                  <th className="point1-line">
                    Revenue
                    <br />
                    (%)
                  </th>
                  <th className="point1-line">
                    Revenue Share
                    <br />
                    (KRW)
                  </th>
                  <th className="point1-line">Edit</th>
                </tr>
              </thead>
              <tbody className="bg-white font-12">
                {rows.map((r, i) => (
                  <tr key={i} className="nowrap text-right">
                    <td className="px-1 text-center">
                      <span className={`product_code dd ${r.textClass}`}>
                        {r.item.product_code}
                      </span>
                    </td>
                    <td className="px-1">
                      <span className={`product_nm_en ${r.textClass}`}>
                        {r.item.product_name_en}
                      </span>
                    </td>
                    <td className="px-1 text-center">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control text-end font-12 px-1"
                          maxLength={2}
                          value={fields[i]?.balence ?? ""}
                          onChange={(e) => setField(i, "balence", e.target.value)}
                        />
                        <span className="input-group-text font-12">%</span>
                      </div>
                    </td>
                    <td className="px-1 text-center">
                      <span className={`rate ${r.textClass}`}>{r.rate}</span>%
                    </td>
                    <td className="px-1 text-center">
                      <span className={`payment_gateway ${r.textClass}`}>{r.item.settlekind}</span>
                    </td>
                    <td className="px-1 text-center">
                      <div className="form-inline">
                        <input
                          type="text"
                          className="form-control text-end font-12"
                          value={fields[i]?.goodsSrp ?? ""}
                          onChange={(e) => setField(i, "goodsSrp", e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`sales_price ${r.textClass}`}>{nf0(r.item.price)}</span>
                    </td>
                    <td className="font-num text-center">
                      <div className="form-inline">
                        <input
                          type="text"
                          className="form-control text-end font-12 px-1"
                          value={fields[i]?.orderSrp ?? ""}
                          onChange={(e) => setField(i, "orderSrp", e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`gross_units_sold ${r.textClass}`}>{nf0(r.item.cc)}</span>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`gross_sales_in_vat ${r.textClass}`}>
                        {nf0(r.grossInVat)}
                      </span>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`gross_sales_ex_vat ${r.textClass}`}>
                        {nf0(r.grossExVat)}
                      </span>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`payment_gateway_fee ${r.textClass}`}>
                        {nf0(r.paymentFee)}
                      </span>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`net_sales ${r.textClass}`}>{nf0(r.netSales)}</span>
                    </td>
                    <td className="px-1 text-center">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control text-end font-12"
                          maxLength={2}
                          value={fields[i]?.revenue ?? ""}
                          onChange={(e) => setField(i, "revenue", e.target.value)}
                        />
                        <span className="input-group-text font-12">%</span>
                      </div>
                    </td>
                    <td className="px-1 text-end">
                      <span className={`revenue_share ${r.textClass}`}>{nf0(r.revenueShare)}</span>
                    </td>
                    <td className="px-1 text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn_edit font-12"
                        onClick={() => onEdit(i)}
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light font-13">
                <tr className="nowrap">
                  <th colSpan={8} className="font-num text-center total">
                    total
                  </th>
                  <th className="text-end px-1">{nf0(totals.cc)}</th>
                  <th className="text-end px-1">{nf0(totals.grossInVat)}</th>
                  <th className="text-end px-1">{nf0(totals.grossExVat)}</th>
                  <th className="text-end px-1">{nf0(totals.paymentFee)}</th>
                  <th className="text-end px-1">{nf0(totals.netSales)}</th>
                  <th className=""></th>
                  <th className="text-end px-1">{nf0(totals.revenueShare)}</th>
                  <th className=""></th>
                </tr>
                <tr>
                  <td colSpan={11}></td>
                  <th className="text-end" colSpan={3}>
                    Royalty payable ({currencyConverter})
                  </th>
                  <td className="text-end px-1">
                    <span className="fw-bold">{nf2(royaltyPayable)}</span>
                  </td>
                  <th className=""></th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
