import { useOrderZtormView, type OrderZtormViewSearch } from "@entities/order";

const BASE_URL = "/order/ztorm_order_view";

const nf = (n: number) => n.toLocaleString("en-US");

// legacy pc/_Admin_/order/ztorm_order_view.php — Ztorm 주문조회(외부 GetOrder API 단건).
export const OrderZtormViewScreen = (search: OrderZtormViewSearch) => {
  const searched = search.search_value !== "";
  const { data } = useOrderZtormView(search);

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
                <li className="breadcrumb-item active">Ztorm 주문조회</li>
              </ol>
            </div>
            <h4 className="page-title">Ztorm 주문조회</h4>
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
                      <th className="text-center">CountryCode</th>
                      <td>{data.order.country_code}</td>
                    </tr>
                    <tr>
                      <th className="text-center">CustomerIP</th>
                      <td>{data.order.customer_ip}</td>
                    </tr>
                    <tr>
                      <th className="text-center">EndTime</th>
                      <td>{data.order.end_time}</td>
                    </tr>
                    <tr>
                      <th className="text-center">IsTest</th>
                      <td>{data.order.is_test}</td>
                    </tr>
                    <tr>
                      <th className="text-center">IsRefund</th>
                      <td>{data.order.is_refund}</td>
                    </tr>
                    <tr>
                      <th className="text-center">RetailerCustomerID</th>
                      <td>{data.order.retailer_customer_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">RetailerOrderID</th>
                      <td>{data.order.retailer_order_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">CustomerProductID</th>
                      <td>{data.order.customer_product_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">IsRefunded</th>
                      <td>{data.order.is_refunded}</td>
                    </tr>
                    <tr>
                      <th className="text-center">ProductID</th>
                      <td>{data.order.product_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">ProductPriceExVAT</th>
                      <td>
                        {nf(data.order.product_price_ex_vat_value)}{" "}
                        {data.order.product_price_ex_vat_currency}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">ProductPriceIncVAT</th>
                      <td>
                        {nf(data.order.product_price_inc_vat_value)}{" "}
                        {data.order.product_price_inc_vat_currency}
                      </td>
                    </tr>
                    <tr>
                      <th className="text-center">VATPercent</th>
                      <td>{data.order.vat_percent}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
