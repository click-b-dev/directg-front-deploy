import { useState } from "react";
import {
  useOrderShipmentShipping,
  useShipCompleteOrderShipment,
  resolveOrderShipmentReadySearch,
  getOrderStatusLabel,
  getShipmentStatusFullLabel,
  ORDER_CANCEL_SEARCH_KEY_OPTIONS,
  type OrderShipmentFixedSearch,
  type OrderShipmentItem,
} from "@entities/order";
import { openDeliveryTracking } from "@shared/lib/delivery-tracking";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_shipment_shipping";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");
const rowKey = (item: OrderShipmentItem, num: number) => `${item.settle_no}-${item.ordno}-${num}`;

// legacy pc/_Admin_/order/order_shipment_shipping.php — 배송중 리스트(shipment_status='4', 선택 배송완료).
export const OrderShipmentShippingScreen = (search: OrderShipmentFixedSearch) => {
  // ready와 동일 날짜 로직(기본 시작 2025-01-01 하드코딩~이번달 말일).
  const resolved = resolveOrderShipmentReadySearch(search);
  const { data } = useOrderShipmentShipping(resolved);
  const shippedMutation = useShipCompleteOrderShipment();
  const [checked, setChecked] = useState<Set<string>>(new Set());

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

  const allKeys = items.map((item, num) => rowKey(item, num));
  const allChecked = allKeys.length > 0 && allKeys.every((k) => checked.has(k));

  const toggleAll = (next: boolean) => setChecked(next ? new Set(allKeys) : new Set());
  const toggleOne = (key: string, next: boolean) => {
    setChecked((prev) => {
      const set = new Set(prev);
      if (next) set.add(key);
      else set.delete(key);
      return set;
    });
  };

  // legacy btnShipped: 선택 항목 → shipment_shipped(배송완료 전환) → reload(invalidate).
  // escw는 legacy `$$kcp_info['escw_yn']` 변수변수 버그로 빈값 전송(재현).
  const handleShipped = () => {
    if (!window.confirm("선택한 주문의 상태를 배송완료로 변경하겠습니까?")) return;
    const selected = items.filter((item, num) => checked.has(rowKey(item, num)));
    shippedMutation.mutate(
      {
        step_arr: selected.map((i) => i.status),
        settle_no_arr: selected.map((i) => i.settle_no),
        escw_arr: selected.map(() => ""), // legacy $$ 버그로 빈값
        tno_arr: selected.map((i) => i.tno ?? ""),
        ordno_arr: selected.map((i) => i.ordno),
      },
      { onSuccess: () => setChecked(new Set()) },
    );
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
                <li className="breadcrumb-item active">배송중 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">배송중 리스트</h4>
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
                <th className="text-center">
                  <input
                    type="checkbox"
                    id="chk_all"
                    className="js-checkall"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="text-center">번호</th>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문번호</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">상품정보</th>
                <th className="text-center">주문금액</th>
                <th className="text-center">주문상태</th>
                <th className="text-center">배송상태</th>
                <th className="text-center">운송장번호</th>
                <th className="text-center">배송조회</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => {
                const key = rowKey(item, num);
                return (
                  <OrderShipmentShippingRow
                    key={key}
                    item={item}
                    rowNo={
                      pagination.total_results - (num + (pagination.current_page - 1) * PER_PAGE)
                    }
                    checked={checked.has(key)}
                    onToggle={(next) => toggleOne(key, next)}
                  />
                );
              })}
            </tbody>
          </table>
          <div className="table-action">
            <div className="pull-left">
              <button type="button" className="btn btn-success" onClick={handleShipped}>
                선택 배송완료
              </button>
            </div>
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

const OrderShipmentShippingRow = ({
  item,
  rowNo,
  checked,
  onToggle,
}: {
  item: OrderShipmentItem;
  rowNo: number;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) => {
  const trackingNumber = item.tracking_number ?? "";
  return (
    <tr>
      <td className="text-center">
        <input
          type="checkbox"
          name="chk"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
        />
      </td>
      <td className="text-center">{rowNo}</td>
      <td className="text-center">{item.order_date}</td>
      <td className="text-center">
        {/* legacy order_view.php?settle_no= — 미이관 링크 */}
        <a href={`order_view.php?settle_no=${item.settle_no}`}>{item.settle_no}</a>
      </td>
      <td className="text-center">{item.ordno}</td>
      <td>{item.m_id}</td>
      {/* legacy: 상품정보 통합(코드 + M뱃지 + 상품명 text-wrap 500px) */}
      <td className="text-start">
        {item.product_code}
        <br />
        {item.is_mobile === "Y" && <span className="badge bg-secondary">M</span>}{" "}
        <p className="text-wrap" style={{ width: "500px" }}>
          {item.product_name}
        </p>
      </td>
      <td className="text-end">{nf(item.price)}</td>
      <td className="text-center">{getOrderStatusLabel(item.status)}</td>
      {/* legacy: 배송상태 = getShipmentStatus 라벨 */}
      <td className="text-center">{getShipmentStatusFullLabel(item.shipment_status)}</td>
      <td className="text-center">{trackingNumber}</td>
      <td className="text-center">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary shadow-none font-12 btn_delivery_search"
          onClick={() => openDeliveryTracking(trackingNumber.replace(/-/g, ""), "001")}
        >
          배송조회
        </button>
      </td>
    </tr>
  );
};
