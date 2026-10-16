import { useRef } from "react";
import {
  useOrderOldList,
  resolveOrderOldListSearch,
  ORDER_ALL_SEARCH_KEY_OPTIONS,
  ORDER_OLD_YEAR_OPTIONS,
  OLD_SETTLEKIND_LABEL,
  OLD_SETTLE_STATUS_LABEL,
  OLD_ORDER_STATUS_LABEL,
  type OrderOldListSearch,
  type OrderOldListItem,
} from "@entities/order";
import { env } from "@shared/config/env";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_old_list";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");
// legacy order_old_excel.php POST 다운로드(백엔드 CSV 스트리밍).
const EXCEL_URL = `${env.apiBaseUrl}/admin/order/old/excel`;

// legacy pc/_Admin_/order/order_old_list.php — 과거주문 리스트(DGKR 아카이브, 연도 기반).
export const OrderOldListScreen = (search: OrderOldListSearch) => {
  const resolved = resolveOrderOldListSearch(search);
  const { data } = useOrderOldList(resolved);
  const excelFormRef = useRef<HTMLFormElement>(null);

  // 페이지네이션은 raw 검색값 유지. legacy $param(=$_GET, page 제외).
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_key", search.search_key);
  addP("search_value", search.search_value);
  addP("search_year", resolved.search_year);
  addP("date_label", resolved.date_label);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

  // legacy: 검색결과 있을 때만 CSV 요청, 아니면 alert.
  const handleExcelDownload = () => {
    if (pagination.total_results > 0) {
      excelFormRef.current?.submit();
    } else {
      window.alert("검색결과가 있는 경우만 가능합니다.");
    }
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
                    주문
                  </a>
                </li>
                <li className="breadcrumb-item">
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    주문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">과거주문 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">과거주문 리스트</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row g-2">
        <div className="card">
          <h5 className="card-header bg-secondary text-white">검색필터</h5>
          <div className="card-body py-2">
            <form className="form-horizontal" method="get" action={BASE_URL}>
              <div className="row mb-2">
                <div className="col-lg-6">
                  <div className="input-group row">
                    <select
                      className="form-select col-sm-3"
                      name="search_key"
                      id="search_key"
                      defaultValue={search.search_key || "search_ordno"}
                    >
                      {ORDER_ALL_SEARCH_KEY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_value"
                        name="search_value"
                        placeholder="검색어"
                        defaultValue={search.search_value}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label className="col-sm-1 col-form-label bg-light border">기간검색</label>
                    <div className="col-sm-1">
                      <select
                        className="form-control input-sm"
                        id="search_year"
                        name="search_year"
                        defaultValue={search.search_year || "2020"}
                      >
                        {ORDER_OLD_YEAR_OPTIONS.map((opt) => (
                          <option key={opt.value || "none"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <DateRangePicker
                      startName="search_start_date"
                      endName="search_end_date"
                      labelName="date_label"
                      initialStart={resolved.search_start_date}
                      initialEnd={resolved.search_end_date}
                      initialLabel={resolved.date_label}
                      emptyLabel="전체기간"
                      rangeColClassName="col-sm-2"
                      inputColClassName="col-sm-4"
                      allPeriodOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      주문내역 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="d-flex flex-row justify-content-between mb-2">
        <div className="float-start">{nf(pagination.total_results)} 개</div>
        <div className="float-end"></div>
      </div>

      <div className="row">
        <div className="col-12">
          <table className="table table-centered w-100  nowrap table-sm table-bordered border-light">
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문번호</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">상품정보</th>
                <th className="text-center">주문금액</th>
                <th className="text-center">결제일자</th>
                <th className="text-center">결제방법</th>
                <th className="text-center">PG</th>
                <th className="text-center">결제상태</th>
                <th className="text-center">주문상태</th>
                <th className="text-center">키확인</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <OrderOldListRow
                  key={`${item.settle_no}-${item.ordno}-${num}`}
                  item={item}
                  searchYear={resolved.search_year}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                  }
                />
              ))}
            </tbody>
          </table>
          <div>
            {/* legacy order_old_excel.php POST — 검색조건 + page 전달, 백엔드 CSV 스트리밍 */}
            <form ref={excelFormRef} action={EXCEL_URL} method="POST">
              <input type="hidden" name="excel_name" value={`주문목록_${resolved.search_year}`} />
              <input type="hidden" name="page" value={String(pagination.current_page)} />
              <input type="hidden" name="search_key" value={search.search_key} />
              <input type="hidden" name="search_value" value={search.search_value} />
              <input type="hidden" name="search_year" value={resolved.search_year} />
            </form>
            <button
              type="button"
              className="btn btn-light shadow-none border"
              id="btn_excel_download"
              onClick={handleExcelDownload}
            >
              <i className="mdi mdi-microsoft-excel font-16" /> CSV 다운로드
            </button>
          </div>
          <div className="text-center mt-3">
            <ServerPagination
              page={pagination.current_page}
              totalPages={pagination.total_pages}
              baseUrl={BASE_URL}
              params={paginationParams}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const OrderOldListRow = ({
  item,
  searchYear,
  rowNo,
}: {
  item: OrderOldListItem;
  searchYear: string;
  rowNo: number;
}) => (
  // legacy row 강조(bg-danger)는 order_system 빈값 판정이 `=` 대입 버그로 죽은 코드 → 항상 미적용.
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.ord_ymd}</td>
    <td className="text-center">
      {/* legacy order_old_view.php?settle_no=&search_year= — 미이관 링크 */}
      <a href={`./order_old_view.php?settle_no=${item.settle_no}&search_year=${searchYear}`}>
        {item.settle_no}
      </a>
    </td>
    <td className="text-center">{item.ordno}</td>
    <td>{item.email}</td>
    <td className="text-start">
      {item.product_nm}
      <br />
      {(item.supp_cd === "4" || item.supp_cd === "5") && (
        <small className="label label-info">번들</small>
      )}
    </td>
    <td className="text-end">{nf(item.tot_pay)}</td>
    <td className="text-center">{item.step !== "1" ? item.cdt : ""}</td>
    <td className="text-center">{OLD_SETTLEKIND_LABEL[item.settlekind] ?? ""}</td>
    <td className="text-center">{item.pg_provider}</td>
    <td className="text-center">{OLD_SETTLE_STATUS_LABEL[item.step] ?? ""}</td>
    <td className="text-center">{OLD_ORDER_STATUS_LABEL[item.status] ?? ""}</td>
    <td className="text-center">{item.is_lic_actv === "1" ? "O" : "X"}</td>
  </tr>
);
