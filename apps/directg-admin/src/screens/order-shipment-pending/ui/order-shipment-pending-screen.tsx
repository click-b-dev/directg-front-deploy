import { useRef } from "react";
import {
  useOrderShipmentPending,
  resolveOrderShipmentFixedSearch,
  getOrderStatusLabel,
  ORDER_CANCEL_SEARCH_KEY_OPTIONS,
  type OrderShipmentFixedSearch,
  type OrderShipmentItem,
} from "@entities/order";
import { env } from "@shared/config/env";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_shipment_pending";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");
// legacy order_excel_export.php POST 다운로드(백엔드 CSV). legacy는 #excelData 부재로 data 빈값(quirk).
const EXCEL_URL = `${env.apiBaseUrl}/admin/order/excel-export`;

// legacy pc/_Admin_/order/order_shipment_pending.php — 배송대기 리스트(shipment_status='2' 고정).
export const OrderShipmentPendingScreen = (search: OrderShipmentFixedSearch) => {
  const resolved = resolveOrderShipmentFixedSearch(search);
  const { data } = useOrderShipmentPending(resolved);
  const excelFormRef = useRef<HTMLFormElement>(null);

  // 페이지네이션은 raw 검색값 유지. legacy $param(=$_GET, page 제외).
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_key", search.search_key);
  addP("search_value", search.search_value);
  addP("search_start_date", search.search_start_date);
  addP("search_end_date", search.search_end_date);
  addP("date_label", search.date_label);

  if (!data) {
    return null;
  }

  const { items, pagination } = data;

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
                <li className="breadcrumb-item active">배송대기 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">배송대기 리스트</h4>
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
                      defaultValue={search.search_key || "search_settle_no"}
                    >
                      {ORDER_CANCEL_SEARCH_KEY_OPTIONS.map((opt) => (
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
                <div className="col-lg-6">
                  <div className="row">
                    <label className="col-sm-2 col-form-label bg-light border">기간검색</label>
                    <DateRangePicker
                      startName="search_start_date"
                      endName="search_end_date"
                      labelName="date_label"
                      initialStart={resolved.search_start_date}
                      initialEnd={resolved.search_end_date}
                      initialLabel={resolved.date_label}
                      rangeColClassName="col-sm-4"
                      inputColClassName="col-sm-6"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-start">
                    {/* legacy: order_excel_export.php POST(#excelData 부재로 data 빈값 quirk) */}
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => excelFormRef.current?.submit()}
                    >
                      엑셀다운로드
                    </button>{" "}
                    (다운로드 된 주문은 배송준비 리스트로 이동됩니다)
                  </div>
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      주문내역 검색
                    </button>
                  </div>
                </div>
              </div>
            </form>
            {/* legacy js-excel-download: order_excel_export.php POST. #excelData 부재로 data 빈값(quirk) */}
            <form ref={excelFormRef} action={EXCEL_URL} method="POST">
              <input type="hidden" name="mode" value="sales_excel_download" />
              <input type="hidden" name="excel_name" value="order_list" />
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
            <thead className="table-light">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문번호</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">상품코드</th>
                <th className="text-center">상품명</th>
                <th className="text-center">주문금액</th>
                <th className="text-center">주문상태</th>
                <th className="text-center">배송상태</th>
                <th className="text-center">수령여부</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <OrderShipmentPendingRow
                  key={`${item.settle_no}-${item.ordno}-${num}`}
                  item={item}
                  rowNo={
                    pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                  }
                />
              ))}
            </tbody>
          </table>
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

const OrderShipmentPendingRow = ({ item, rowNo }: { item: OrderShipmentItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.order_date}</td>
    <td className="text-center">
      {/* legacy order_view.php?settle_no= — 미이관 링크 */}
      <a href={`order_view.php?settle_no=${item.settle_no}`}>{item.settle_no}</a>
    </td>
    <td className="text-center">{item.ordno}</td>
    <td>{item.m_id}</td>
    <td className="text-center">{item.product_code}</td>
    <td className="text-start">
      {item.is_mobile === "Y" && <span className="badge bg-secondary">M</span>} {item.product_name}
    </td>
    <td className="text-end">{nf(item.price)}</td>
    <td className="text-center">{getOrderStatusLabel(item.status)}</td>
    {/* legacy: 배송상태 = send_status raw(라벨 변환 없음) */}
    <td className="text-center">{item.send_status}</td>
    <td className="text-center">{item.is_actv === "1" ? "O" : "X"}</td>
  </tr>
);
