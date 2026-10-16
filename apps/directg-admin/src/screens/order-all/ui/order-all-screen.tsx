import {
  useOrderAll,
  resolveOrderAllSearch,
  getCheckoutStatusLabel,
  getOrderStatusLabel,
  getDeliveryTypeLabel,
  ORDER_ALL_SEARCH_KEY_OPTIONS,
  ORDER_SYSTEM_OPTIONS,
  type OrderAllSearch,
  type OrderAllItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_all";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/order_all.php — 주문통합 리스트(주문 관리 v2, tbl_order⋈tbl_order_item).
export const OrderAllScreen = (search: OrderAllSearch) => {
  // order_all.php: 기본 기간 오늘~오늘 + search_value 우선 기간무시 + order_system 기본 all.
  const resolved = resolveOrderAllSearch(search);
  const { data } = useOrderAll(resolved);

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
  addP("order_system", search.order_system);

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
                <li className="breadcrumb-item active">주문통합 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">주문통합 리스트</h4>
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
                      emptyLabel="오늘"
                      rangeColClassName="col-sm-4"
                      inputColClassName="col-sm-6"
                    />
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="order_system"
                      className="col-sm-1 col-form-label col-form-label-sm bg-light border"
                    >
                      연동시스템
                    </label>
                    <div className="col-sm-10 pt-1">
                      {ORDER_SYSTEM_OPTIONS.map((opt) => (
                        <div className="form-check form-check-inline" key={opt.value}>
                          <input
                            type="radio"
                            id={`order_system_${opt.value}`}
                            name="order_system"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={resolved.order_system === opt.value}
                          />
                          <label className="form-check-label" htmlFor={`order_system_${opt.value}`}>
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
            <thead className="table-light font-13">
              <tr>
                <th className="text-center">번호</th>
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">결제상태</th>
                <th className="text-center">주문번호</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">상품정보</th>
                <th className="text-center">주문금액</th>
                <th className="text-center">주문상태</th>
                <th className="text-center">수령여부</th>
                <th className="text-center">배송유형</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <OrderAllRow
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

const OrderAllRow = ({ item, rowNo }: { item: OrderAllItem; rowNo: number }) => (
  // legacy row 강조(bg-danger)는 order_system 빈값 판정이 `=` 대입 버그로 죽은 코드 → 항상 미적용.
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.order_date}</td>
    <td className="text-center">
      {/* legacy order_view.php?settle_no= — 미이관 링크 */}
      <a href={`order_view.php?settle_no=${item.settle_no}`}>{item.settle_no}</a>
    </td>
    <td className="text-center">{getCheckoutStatusLabel(item.step)}</td>
    <td className="text-center">{item.ordno}</td>
    <td>
      {item.m_id}
      <br />({item.ip})
    </td>
    <td className="text-start">
      {item.product_code}
      <br />
      {item.is_mobile === "Y" && <span className="badge bg-secondary">M</span>} {item.product_name}
    </td>
    <td className="text-end">{nf(item.price)}</td>
    <td className="text-center">{getOrderStatusLabel(item.status)}</td>
    <td className="text-center">
      {item.is_actv === "0" ? (
        <span className="badge bg-secondary font-12">수령대기</span>
      ) : (
        <span className="badge bg-success font-12">수령완료</span>
      )}
    </td>
    <td className="text-center">{getDeliveryTypeLabel(item.delivery_type)}</td>
  </tr>
);
