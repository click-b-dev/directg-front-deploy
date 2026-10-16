import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  usePartnerReportList,
  usePartnerListAll,
  type PartnerReportListSearch,
} from "@entities/partner";
import { env } from "@shared/config/env";

const BASE_URL = "/partner/report_list_use";

const nf0 = (n: number) => Math.round(n).toLocaleString("en-US");
const nf2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
// legacy report_list_use: 연도보정 없음(report_list의 quirk 제거). 기본 현재연도/전월.
const DEFAULT_YEAR = String(CURRENT_YEAR);
const DEFAULT_MONTH = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
const DEFAULT_MONTH_TERM = String(Math.ceil((now.getMonth() + 1) / 3));

// legacy pc/_Admin_/partner/report_list_use.php — 리포트 내역 (상용화). is_system='Y' 파트너.
export const PartnerReportListUseScreen = (search: PartnerReportListSearch) => {
  const navigate = useNavigate();

  const confReportTerm = search.search_report_term || "M";
  const confYear = search.search_year || DEFAULT_YEAR;
  const confPublisher = search.search_publisher_code;
  // legacy: publisher 있어도 month 유지(report_list의 month="" quirk 없음).
  const confMonth =
    confReportTerm === "M"
      ? search.search_month || DEFAULT_MONTH
      : search.search_month_term || DEFAULT_MONTH_TERM;

  const { data } = usePartnerReportList({
    publisher_code: confPublisher,
    report_term: confReportTerm,
    year: confYear,
    month: confMonth,
  });
  // legacy getPartnerListAll('Y') — is_system='Y' 파트너만.
  const { data: partners } = usePartnerListAll("Y");

  const [reportTerm, setReportTerm] = useState(confReportTerm);
  const [year, setYear] = useState(confYear);
  const [month, setMonth] = useState(
    confReportTerm === "M" ? search.search_month || DEFAULT_MONTH : DEFAULT_MONTH,
  );
  const [monthTerm, setMonthTerm] = useState(
    confReportTerm === "T" ? search.search_month_term || DEFAULT_MONTH_TERM : DEFAULT_MONTH_TERM,
  );
  const [publisher, setPublisher] = useState(confPublisher);

  const years: number[] = [];
  for (let y = 2013; y <= CURRENT_YEAR; y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const quarters = [1, 2, 3, 4];

  const items = data?.items ?? [];
  const totalSold = data?.total_sold ?? 0;
  const totalPrice = data?.total_price ?? 0;

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({
      to: BASE_URL,
      search: {
        search_publisher_code: publisher,
        search_report_term: reportTerm,
        search_year: year,
        search_month: reportTerm === "M" ? month : "",
        search_month_term: reportTerm === "T" ? monthTerm : "",
      },
    });
  };

  const onDownload = (idx: number) => {
    window.location.href = `${env.apiBaseUrl}/admin/partner/report/download?idx=${idx}`;
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
                <li className="breadcrumb-item active">리포트 내역 (상용화)</li>
              </ol>
            </div>
            <h4 className="page-title">리포트 내역 (상용화)</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body p-2">
            <form className="form-horizontal" onSubmit={onSearch}>
              <div className="row gx-3 gy-2 mb-2">
                <div className="col-2">
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
                <div className="col-2">
                  <div className="row">
                    <label className="col-sm-4 col-form-label-sm bg-light border font-14 px-1">
                      기간
                    </label>
                    <div className="col-sm-8">
                      <select
                        className="form-select form-select-sm"
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
                  </div>
                </div>
                <div className="col-5">
                  <div className="row">
                    <div className="col-sm-12 px-0">
                      <div
                        className="input-group"
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
                        className="input-group"
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
              <div className="row gx-3 gy-2 mb-2">
                <div className="col-3">
                  <div className="row">
                    <label
                      htmlFor="search_publisher_code"
                      className="col-sm-3 col-form-label-sm bg-light border font-14 px-1"
                    >
                      파트너
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="search_publisher_code"
                        name="search_publisher_code"
                        className="form-select-sm"
                        value={publisher}
                        onChange={(e) => setPublisher(e.target.value)}
                      >
                        <option value="">:::파트너 선택:::</option>
                        {(partners ?? []).map((p) => (
                          <option key={p.publisher_code} value={p.publisher_code}>
                            {p.publisher_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-9">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none" id="btn_search">
                      리포트 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf0(items.length)} 개</div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <colgroup>
              <col width="20%" />
              <col width="*" />
              <col width="6%" />
              <col width="10%" />
              <col width="10%" />
              <col width="6%" />
              <col width="8%" />
              <col width="10%" />
            </colgroup>
            <thead className="table-light">
              <tr>
                <th className="text-center">파트너</th>
                <th className="text-center">리포트 제목</th>
                <th className="text-center">수량</th>
                <th className="text-center">합계 (KRW)</th>
                <th className="text-center">Royalty Payable</th>
                <th className="text-center">상태</th>
                <th className="text-center">상세보기</th>
                <th className="text-center">다운로드</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((report) => (
                <tr key={report.idx}>
                  <td className="text-start">{report.publisher_name}</td>
                  <td className="text-start">
                    {report.report_year}년 {report.report_month}
                    {report.report_term === "T" ? "분기" : "월"} 리포트 내역입니다.
                  </td>
                  <td className="text-end">{nf0(report.total_sold)}</td>
                  <td className="text-end">{nf0(report.total)} 원</td>
                  <td className="text-end">
                    {report.currency_converter} {nf2(report.total * report.royalty)}
                  </td>
                  <td className="text-center">{report.status}</td>
                  <td className="text-center">
                    <a
                      href={`/partner/report_view?idx=${report.idx}`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      상세보기
                    </a>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success btn_report_download"
                      onClick={() => onDownload(report.idx)}
                    >
                      <i className="mdi mdi-download me-2 text-success vertical-middle font-14"></i>{" "}
                      엑셀 다운로드
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <th className="text-center" colSpan={2}>
                  {confYear}년 {confMonth}월 합계
                </th>
                <th className="text-end">{nf0(totalSold)}</th>
                <th className="text-end">{nf0(totalPrice)} 원</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};
