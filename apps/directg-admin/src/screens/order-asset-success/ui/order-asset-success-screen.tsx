import {
  useOrderAssetSuccess,
  resolveOrderAssetSuccessSearch,
  ORDER_ASSET_SEARCH_KEY_OPTIONS,
  type OrderAssetSuccessSearch,
  type OrderAssetSuccessItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_asset_success";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/order_asset_success.php — Asset 주문완료(tbl_order_item_asset).
export const OrderAssetSuccessScreen = (search: OrderAssetSuccessSearch) => {
  // order_asset_success.php: 기본 기간 오늘~오늘 + search_value 우선 기간무시.
  const resolved = resolveOrderAssetSuccessSearch(search);
  const { data } = useOrderAssetSuccess(resolved);

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
                    Asset 주문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Asset 주문완료</li>
              </ol>
            </div>
            <h4 className="page-title">Asset 주문완료</h4>
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
                      {ORDER_ASSET_SEARCH_KEY_OPTIONS.map((opt) => (
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
                    <DateRangePicker
                      startName="search_start_date"
                      endName="search_end_date"
                      labelName="date_label"
                      initialStart={resolved.search_start_date}
                      initialEnd={resolved.search_end_date}
                      initialLabel={resolved.date_label}
                      emptyLabel="오늘"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      Asset 주문 검색
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
                <th className="text-center">주문번호</th>
                <th className="text-center">회원아이디</th>
                <th className="text-center">상품정보</th>
                <th className="text-center">Asset 정보</th>
                <th className="text-center">Reseve ID</th>
                <th className="text-center">상세보기</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <OrderAssetSuccessRow
                  key={`${item.ordno}-${item.asset_id}-${num}`}
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

const OrderAssetSuccessRow = ({ item, rowNo }: { item: OrderAssetSuccessItem; rowNo: number }) => (
  // legacy: asset_type=="임시코드"면 bg-danger, else bg-white.
  <tr className={item.asset_type === "임시코드" ? "bg-danger" : "bg-white"}>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.order_date}</td>
    <td className="text-center">{item.ordno}</td>
    <td>
      {item.m_id}
      <br />({item.m_no})
    </td>
    <td className="text-start">
      {item.product_code}
      <br />
      <div className="text-wrap" style={{ width: "25rem" }}>
        {item.product_name}
      </div>
    </td>
    <td className="text-start">
      [{item.asset_id}]<br />
      <div className="text-wrap" style={{ width: "25rem" }}>
        {item.asset_name}
      </div>
      <span className="badge bg-dark text-light font-11 fw-normal">{item.asset_type}</span>{" "}
      <span className="badge bg-secondary text-light font-11 fw-normal">
        {item.asset_publisher}
      </span>
    </td>
    <td className="text-center">{item.reserve_id}</td>
    <td className="text-center"></td>
  </tr>
);
