import {
  useOrderShipmentAll,
  resolveOrderShipmentAllSearch,
  getOrderStatusLabel,
  ORDER_CANCEL_SEARCH_KEY_OPTIONS,
  SHIPMENT_STATUS_LABEL,
  SHIPMENT_STATUS_OPTIONS,
  SHIPMENT_PRESET_KEYS,
  type OrderShipmentAllSearch,
  type OrderShipmentItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_shipment_all";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/order_shipment_all.php — 배송통합 리스트(택배 배송 주문 관리 v2).
export const OrderShipmentAllScreen = (search: OrderShipmentAllSearch) => {
  // order_shipment_all.php: 기본 지난달 1일~이번달 말일 + search_value 우선 기간무시.
  const resolved = resolveOrderShipmentAllSearch(search);
  const { data } = useOrderShipmentAll(resolved);

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
  addP("search_shipment_status", search.search_shipment_status);

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
                <li className="breadcrumb-item active">배송통합 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">배송통합 리스트</h4>
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
                      presetKeys={SHIPMENT_PRESET_KEYS}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <div className="row">
                    <h6 className="col-sm-2 col-form-label col-form-label-sm bg-light border">
                      배송상태
                    </h6>
                    <div className="col-sm-10 mt-1">
                      {SHIPMENT_STATUS_OPTIONS.map((opt) => (
                        <div className="form-check form-check-inline" key={opt.value}>
                          <input
                            type="radio"
                            id={`search_shipment_status_${opt.value}`}
                            name="search_shipment_status"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={search.search_shipment_status === opt.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_shipment_status_${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
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
                <OrderShipmentAllRow
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

const OrderShipmentAllRow = ({ item, rowNo }: { item: OrderShipmentItem; rowNo: number }) => (
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
    <td className="text-center">{SHIPMENT_STATUS_LABEL[item.shipment_status] ?? ""}</td>
    <td className="text-center">{item.is_actv === "1" ? "O" : "X"}</td>
  </tr>
);
