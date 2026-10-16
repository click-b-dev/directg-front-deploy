import {
  useOrderPaymentReady,
  resolveOrderPaymentReadySearch,
  getSettleKindLabel,
  PG_PROVIDER_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  type OrderPaymentReadySearch,
  type OrderPaymentReadyItem,
} from "@entities/order";
import { DateRangePicker, ServerPagination } from "@shared/ui";

const BASE_URL = "/order/order_step1";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/order_step1.php — 입금대기 리스트(결제 관리 v2, tbl_order step='1').
export const OrderStep1Screen = (search: OrderPaymentReadySearch) => {
  // order_step1.php 22~102: 날짜 기본값(-2day/today) + settle_no/m_id 우선 기간무시 정규화.
  const resolved = resolveOrderPaymentReadySearch(search);
  const { data } = useOrderPaymentReady(resolved);

  // 페이지네이션은 raw 검색값(제출된 URL 파라미터) 유지. legacy $param(=$_GET, page 제외).
  const paginationParams: Record<string, string> = {};
  const addP = (key: string, value: string) => {
    if (value !== "") paginationParams[key] = value;
  };
  addP("search_settle_no", search.search_settle_no);
  addP("search_m_id", search.search_m_id);
  addP("search_pg_provider", search.search_pg_provider);
  addP("search_payment_method", search.search_payment_method);
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
                    결제 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">입금 대기 리스트</li>
              </ol>
            </div>
            <h4 className="page-title">입금 대기 리스트</h4>
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
                <div className="col-lg-3">
                  <div className="row">
                    <label
                      htmlFor="search_settle_no"
                      className="col-sm-4 col-form-label bg-light border"
                    >
                      결제번호
                    </label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="search_settle_no"
                        name="search_settle_no"
                        placeholder="결제번호"
                        defaultValue={search.search_settle_no}
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
                    <label
                      htmlFor="search_pg_provider"
                      className="col-sm-1 col-form-label col-form-label-sm bg-light border"
                    >
                      결제 PG
                    </label>
                    <div className="col-sm-11 pt-1">
                      {PG_PROVIDER_OPTIONS.map((opt) => (
                        <div className="form-check form-check-inline" key={opt.value}>
                          <input
                            type="radio"
                            id={`search_pg_provider_${opt.value}`}
                            name="search_pg_provider"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={resolved.search_pg_provider === opt.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_pg_provider_${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-lg-12">
                  <div className="row">
                    <label
                      htmlFor="search_payment_method"
                      className="col-sm-1 col-form-label col-form-label-sm bg-light border"
                    >
                      결제수단
                    </label>
                    <div className="col-sm-11 pt-1">
                      {PAYMENT_METHOD_OPTIONS.map((opt) => (
                        <div className="form-check form-check-inline" key={opt.value}>
                          <input
                            type="radio"
                            id={`search_payment_method_${opt.value}`}
                            name="search_payment_method"
                            className="form-check-input"
                            value={opt.value}
                            defaultChecked={resolved.search_payment_method === opt.value}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`search_payment_method_${opt.value}`}
                          >
                            {opt.label}
                          </label>
                        </div>
                      ))}
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
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-12">
                  <div className="float-end">
                    <button type="submit" className="btn btn-primary shadow-none">
                      결제내역 검색
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
                <th className="text-center">주문일자</th>
                <th className="text-center">결제번호</th>
                <th className="text-center">주문자</th>
                <th className="text-center">주문IP</th>
                <th className="text-center">PG</th>
                <th className="text-center">결제수단</th>
                <th className="text-center">결제금액</th>
                <th className="text-center">결제상태</th>
                <th className="text-center">결제버전</th>
                <th className="text-center">결제플랫폼</th>
              </tr>
            </thead>
            <tbody className="bg-white font-12">
              {items.map((item) => (
                <OrderStep1Row key={item.settle_no} item={item} />
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

const OrderStep1Row = ({ item }: { item: OrderPaymentReadyItem }) => (
  <tr>
    <td className="text-center">{item.reg_date}</td>
    <td className="text-center">
      {/* legacy order_view.php?settle_no= — 미이관 링크 */}
      <a href={`order_view.php?settle_no=${item.settle_no}`}>{item.settle_no}</a>
    </td>
    <td>{item.m_id}</td>
    <td className="text-center">{item.ip}</td>
    <td className="text-center">{item.pg_provider}</td>
    <td className="text-center">{getSettleKindLabel(item.payment_method)}</td>
    <td className="text-end">{nf(item.total_price)}</td>
    <td className="text-center">{item.step}</td>
    <td className="text-center">{item.version}</td>
    <td className="text-center">{item.is_mobile === "Y" ? "모바일" : "PC"}</td>
  </tr>
);
