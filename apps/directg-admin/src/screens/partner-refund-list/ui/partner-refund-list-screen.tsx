import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  usePartnerRefundList,
  usePartnerListAll,
  useSyncPartnerRefund,
  type PartnerRefundListSearch,
} from "@entities/partner";
import { env } from "@shared/config/env";

const BASE_URL = "/partner/refund_list";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy 15~26: search_year 기본=현재연도, search_month 기본=전월.
// 차이(sales와): 전월이 "12"이면 search_year -= 1(연도 보정).
const now = new Date();
const PREV_MONTH = now.getMonth() === 0 ? 12 : now.getMonth();
const DEFAULT_MONTH = String(PREV_MONTH).padStart(2, "0");
const DEFAULT_YEAR = String(PREV_MONTH === 12 ? now.getFullYear() - 1 : now.getFullYear());

// legacy pc/_Admin_/partner/refund_list.php — Refund list 동기화.
export const PartnerRefundListScreen = (search: PartnerRefundListSearch) => {
  const navigate = useNavigate();

  const year = search.search_year || DEFAULT_YEAR;
  const month = search.search_month || DEFAULT_MONTH;
  const publisherCode = search.search_publisher_code;

  const { data } = usePartnerRefundList({
    search_publisher_code: publisherCode,
    search_year: year,
    search_month: month,
  });
  const { data: partners } = usePartnerListAll();
  const syncMutation = useSyncPartnerRefund();

  const [formYear, setFormYear] = useState(year);
  const [formMonth, setFormMonth] = useState(month);
  const [formPublisher, setFormPublisher] = useState(publisherCode);

  const years: number[] = [];
  for (let y = 2021; y <= now.getFullYear(); y++) years.push(y);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate({
      to: BASE_URL,
      search: {
        search_publisher_code: formPublisher,
        search_year: formYear,
        search_month: formMonth,
      },
    });
  };

  // legacy btn_refund_sync: 파트너 미선택 alert. POST refund_batch 후 조회 조건으로 이동.
  const onSync = () => {
    if (!formPublisher) {
      window.alert("퍼블리셔를 선택하세요.");
      return;
    }
    syncMutation.mutate(
      { publisher_code: Number(formPublisher), year: formYear, month: formMonth },
      {
        onSuccess: () =>
          navigate({
            to: BASE_URL,
            search: {
              search_publisher_code: formPublisher,
              search_year: formYear,
              search_month: formMonth,
            },
          }),
      },
    );
  };

  // legacy btn_excel_download: china 선례대로 백엔드 GET 위임(.xls 파일 응답).
  const onExcelDownload = () => {
    window.location.href = `${env.apiBaseUrl}/admin/partner/refund-list/excel?publisher_code=${formPublisher}&year=${formYear}&month=${formMonth}`;
  };

  const items = data?.items ?? [];
  const totalSold = data?.total_sold ?? 0;
  const totalPrice = data?.total_price ?? 0;

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
                <li className="breadcrumb-item active">Refund list 동기화</li>
              </ol>
            </div>
            <h4 className="page-title">Refund list 동기화</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" onSubmit={onSearch}>
              <div className="row mb-3">
                <div className="col-8">
                  <div className="row">
                    <label
                      htmlFor="reportrange"
                      className="col-sm-1 col-form-label bg-light border"
                    >
                      기간검색
                    </label>
                    <div className="col-sm-11">
                      <div className="input-group">
                        <select
                          className="form-select"
                          id="search_year"
                          name="search_year"
                          value={formYear}
                          onChange={(e) => setFormYear(e.target.value)}
                        >
                          <option value="">:::년도:::</option>
                          {years.map((y) => (
                            <option key={y} value={y}>
                              {y}년
                            </option>
                          ))}
                        </select>
                        <div className="ms-2">
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
                                  checked={formMonth === mm}
                                  onChange={(e) => setFormMonth(e.target.value)}
                                />
                                <label
                                  className="btn btn-outline-secondary shadow-none"
                                  htmlFor={`search_month_${m}`}
                                >
                                  {mm}월
                                </label>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="row">
                    <label
                      htmlFor="search_publisher_code"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      파트너
                    </label>
                    <div className="col-sm-9">
                      <select
                        id="search_publisher_code"
                        name="search_publisher_code"
                        className="form-control"
                        value={formPublisher}
                        onChange={(e) => setFormPublisher(e.target.value)}
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
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center">
                    <button type="submit" className="btn btn-secondary shadow-none" id="btn_search">
                      Refund list 조회
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">
          <button type="button" className="btn btn-primary shadow-none" onClick={onSync}>
            Refund list 동기화
          </button>
        </div>
        <div className="float-end">
          <button
            type="button"
            className="btn btn-light shadow-none border"
            onClick={onExcelDownload}
          >
            <i className="mdi mdi-microsoft-excel font-16"></i> Refund list 엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(items.length)} 개</div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <colgroup>
              <col width="15%" />
              <col width="10%" />
              <col width="*" />
              <col width="10%" />
              <col width="10%" />
              <col width="10%" />
            </colgroup>
            <thead className="table-light">
              <tr>
                <th className="text-center">파트너명</th>
                <th className="text-center">옵션상품코드</th>
                <th className="text-center">옵션상품명</th>
                <th className="text-center">SRP</th>
                <th className="text-center">판매수량</th>
                <th className="text-center">합계</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="text-center">{item.publisher_name}</td>
                  <td className="text-center">{item.product_code}</td>
                  <td className="text-start">{item.product_nm}</td>
                  <td className="text-end">{nf(item.order_srp)}</td>
                  <td className="text-end">
                    <span className="total_count">{nf(item.cc)}</span>
                  </td>
                  <td className="text-end">
                    <span className="total_price">{nf(item.sum_settleprice)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <th className="text-center" colSpan={3}>
                  {year}년 {month}월 합계
                </th>
                <th></th>
                <th className="text-end">{nf(totalSold)}</th>
                <th className="text-end">{nf(totalPrice)} 원</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};
