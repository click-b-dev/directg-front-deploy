import { useOrderGenbaView, type OrderGenbaViewSearch } from "@entities/order";

const BASE_URL = "/order/genba_order_view";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy genba_order_view.php <style> 이식 (중첩 Keys 서브테이블 레이아웃).
const GENBA_VIEW_CSS = `
.nested-container { padding: 16px !important; background-color: #ffffff; }
.sub-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.sub-table td { padding: 2px 0 !important; border: none !important; }
.sub-col-key { width: 40%; color: #6c757d; }
.sub-col-val { width: 60%; }
`;

// legacy genba_order_view.php — Genba 주문조회(외부 GetOrder API 단건).
export const OrderGenbaViewScreen = (search: OrderGenbaViewSearch) => {
  const searched = search.search_value !== "";
  const { data } = useOrderGenbaView(search);

  return (
    <>
      <style>{GENBA_VIEW_CSS}</style>
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
                    Genba 주문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Genba 주문조회</li>
              </ol>
            </div>
            <h4 className="page-title">Genba 주문조회</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      {/* 검색필터 */}
      <div className="row">
        <div className="col-xl-6">
          <div className="card">
            <h5 className="card-header bg-secondary text-white">검색필터</h5>
            <div className="card-body">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row mb-2">
                  <div className="col-lg-12">
                    <div className="input-group row">
                      <label className="col-sm-3 col-form-label bg-light border">검색어</label>
                      <div className="col-sm-3">
                        <select
                          className="form-select"
                          name="search_type"
                          defaultValue={search.search_type || "ordno"}
                        >
                          <option value="ordno">주문번호</option>
                          <option value="item_order_id">Item Order ID</option>
                          <option value="client_transaction_id">ClientTransactionID</option>
                        </select>
                      </div>
                      <div className="col-sm-6 ps-0">
                        <input
                          type="text"
                          className="form-control"
                          id="search_value"
                          name="search_value"
                          defaultValue={search.search_value}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="float-end">
                      <button type="submit" className="btn btn-primary shadow-none">
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searched && data && data.found && data.order && (
        <div className="row">
          <div className="col-xl-6">
            <div className="card">
              <div className="card-body">
                <table className="table table-bordered" style={{ marginBottom: "0px" }}>
                  <colgroup>
                    <col style={{ width: "30%", backgroundColor: "#f8f9fa" }} />
                    <col style={{ width: "70%" }} />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="text-center">ClientTransactionID</th>
                      <td>{data.order.client_transaction_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">Order ID</th>
                      <td>{data.order.order_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">ReservationID</th>
                      <td>{data.order.reservation_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">Sku</th>
                      <td>{data.order.sku}</td>
                    </tr>
                    <tr>
                      <th className="text-center">Created</th>
                      <td>{data.order.created}</td>
                    </tr>
                    <tr>
                      <th className="text-center">State*</th>
                      <td>{data.order.state}</td>
                    </tr>
                    <tr>
                      <th className="text-center">CommunicatedBuyingPrice</th>
                      <td>
                        {nf(data.order.communicated_buying_price_amount)}{" "}
                        {data.order.communicated_buying_price_currency}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">ActualBuyingPrice</th>
                      <td>
                        {nf(data.order.actual_buying_price_amount)}{" "}
                        {data.order.actual_buying_price_currency}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">SellingPrice</th>
                      <td>
                        <del>
                          {nf(data.order.selling_price_gross_amount)}{" "}
                          {data.order.selling_price_currency}
                          <br />
                        </del>
                        {nf(data.order.selling_price_net_amount)}{" "}
                        {data.order.selling_price_currency}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">Keys</th>
                      <td className="nested-container">
                        <table className="sub-table">
                          <colgroup>
                            <col className="sub-col-key" />
                            <col className="sub-col-val" />
                          </colgroup>
                          <tbody>
                            {data.order.keys.map((key, idx) => (
                              <GenbaKeyRows key={`${key.code}-${idx}`} item={key} />
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <b>State</b>
              </div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  0 : 주문이 백그라운드에서 처리 중이며, 완료될 때까지 시리얼 번호가 포함되지
                  않습니다.
                </li>
                <li className="list-group-item">
                  1 : 주문에 아직 시리얼 번호가 없으며, 제품이 출시되는 즉시 상태가 변경됩니다.
                </li>
                <li className="list-group-item">
                  2 : 주문이 완료되었으며 응답에서 시리얼 번호를 확인할 수 있습니다.
                </li>
                <li className="list-group-item">
                  3 : 주문이 반환되었으며 더 이상 시리얼 번호가 표시되지 않습니다.
                </li>
                <li className="list-group-item">
                  4 : 이 상태는 일반적으로 주문 초기 처리가 진행 중일 때만 발생합니다.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {searched && data && !data.found && (
        <div className="alert alert-danger" role="alert">
          {data.error} : 주문 정보를 찾을 수 없습니다.
        </div>
      )}
    </>
  );
};

// legacy: Keys[] 각 항목마다 Code/KeyType/Sku/ProductName 4행 반복.
const GenbaKeyRows = ({
  item,
}: {
  item: { code: string; key_type: string; sku: string; product_name: string };
}) => (
  <>
    <tr>
      <td>Code</td>
      <td>{item.code}</td>
    </tr>
    <tr>
      <td>KeyType</td>
      <td>{item.key_type}</td>
    </tr>
    <tr>
      <td>Sku</td>
      <td>{item.sku}</td>
    </tr>
    <tr>
      <td>ProductName</td>
      <td>{item.product_name}</td>
    </tr>
  </>
);
