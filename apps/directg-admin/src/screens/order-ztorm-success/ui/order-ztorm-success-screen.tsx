import {
  useOrderZtormSuccess,
  resolveOrderZtormSuccessSearch,
  type OrderZtormSuccessSearch,
  type OrderZtormSuccessItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_ztorm_success";
const PER_PAGE = 20;

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/order_ztorm_success.php — Ztorm 주문완료(tbl_order_item_ztorm).
export const OrderZtormSuccessScreen = (search: OrderZtormSuccessSearch) => {
  // order_ztorm_success.php: 기본 기간 이번달 1일~말일 + 키워드 3종 우선 기간무시.
  const resolved = resolveOrderZtormSuccessSearch(search);
  const { data } = useOrderZtormSuccess(resolved);

  // 페이지네이션은 raw 검색값 유지. legacy $param(=$_GET, page 제외).
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_ordno", search.search_ordno);
  addP("search_ztorm_id", search.search_ztorm_id);
  addP("search_m_id", search.search_m_id);
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
                    Ztorm 주문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Ztorm 주문완료</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 주문완료</h4>
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
              <input type="hidden" name="date_label" value={search.date_label} />
              <div className="row mb-2">
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_ordno"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      주문번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_ordno"
                        name="search_ordno"
                        placeholder="주문번호"
                        defaultValue={search.search_ordno}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_ztorm_id"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      Ztorm Product ID
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_ztorm_id"
                        name="search_ztorm_id"
                        placeholder="Ztorm Product ID"
                        defaultValue={search.search_ztorm_id}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="row">
                    <label
                      htmlFor="search_m_id"
                      className="col-sm-3 col-form-label bg-light border"
                    >
                      회원아이디
                    </label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        id="search_m_id"
                        name="search_m_id"
                        placeholder="회원아이디(이메일)"
                        defaultValue={search.search_m_id}
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
                      emptyLabel="이번달"
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      Ztorm 주문 검색
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
                <th className="text-center">Ztorm 정보</th>
                <th className="text-center">customer_product_id</th>
                <th className="text-center">키확인</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item, num) => (
                <OrderZtormSuccessRow
                  key={`${item.ordno}-${item.ztorm_item_id}-${num}`}
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

const OrderZtormSuccessRow = ({ item, rowNo }: { item: OrderZtormSuccessItem; rowNo: number }) => (
  <tr>
    <td className="text-center">{rowNo}</td>
    <td className="text-center">{item.order_date}</td>
    <td className="text-center">{item.ordno}</td>
    <td>{item.m_id}</td>
    <td className="text-start">
      {item.product_code}
      <br />
      {item.product_name}
    </td>
    <td className="text-start">
      [{item.ztorm_item_id}]<br />
      {item.ztorm_item_name}
      <br />
      <span className="badge bg-secondary text-light font-11 fw-normal">
        {item.ztorm_publisher}
      </span>
    </td>
    <td className="text-center">{item.customer_product_id}</td>
    <td className="text-center">
      {/* legacy: 클릭 핸들러 없는 inert 버튼(data-customerproductid만 부여). 무동작 그대로 이식. */}
      <button
        type="button"
        className="btn btn-sm btn-info shadow-none"
        data-customerproductid={item.customer_product_id}
      >
        키확인
      </button>
    </td>
  </tr>
);
