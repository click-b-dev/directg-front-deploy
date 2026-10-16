import { useOrderVaultnView, type OrderVaultnViewSearch } from "@entities/order";

const BASE_URL = "/order/vaultn_order_view";

// legacy number_format((int)$x) — 정수 캐스팅 후 천단위 콤마.
const nfInt = (n: number) => Math.trunc(n).toLocaleString("en-US");
// legacy number_format((float)$x, 2) — 소수 2자리 + 천단위 콤마.
const nf2 = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// legacy vaultn_order_view.php <style> 이식.
const VAULTN_VIEW_CSS = `
.col-label { width: 30%; }
.col-value { width: 70%; }
.text-break { word-break: break-all; }
.nested-container { padding: 16px !important; background-color: #ffffff; }
.sub-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
.sub-table td { padding: 2px 0 !important; border: none !important; }
.sub-col-key { width: 40%; color: #6c757d; }
.sub-col-val { width: 60%; }
.nested-card { background-color: #f1f3f5; padding: 14px; border-radius: 4px; border: 1px solid #e9ecef; }
.nested-card .card-title { font-weight: bold; margin-bottom: 10px; color: #343a40; }
.size-sm { font-size: 13px; }
.size-sm td { padding: 1px 0 !important; }
`;

// legacy vaultn_order_view.php — Vaultn 주문조회(외부 RetrieveOrder API 단건).
export const OrderVaultnViewScreen = (search: OrderVaultnViewSearch) => {
  const searched = search.search_value !== "";
  const { data } = useOrderVaultnView(search);

  return (
    <>
      <style>{VAULTN_VIEW_CSS}</style>
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
                    Vaultn 주문 관리
                  </a>
                </li>
                <li className="breadcrumb-item active">Vaultn 주문조회</li>
              </ol>
            </div>
            <h4 className="page-title">Vaultn 주문조회</h4>
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
                          placeholder="주문번호"
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
                    <col className="col-label" />
                    <col className="col-value" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th className="text-center">orderId</th>
                      <td>{data.order.order_id}</td>
                    </tr>
                    <tr>
                      <th className="text-center">clientOrderReference</th>
                      <td>{data.order.client_order_reference}</td>
                    </tr>
                    <tr>
                      <th className="text-center">clientCustomerReference</th>
                      <td>{data.order.client_customer_reference}</td>
                    </tr>
                    <tr>
                      <th className="text-center">Created</th>
                      <td>{data.order.created}</td>
                    </tr>
                    <tr>
                      <th className="text-center">status</th>
                      <td>{data.order.status}</td>
                    </tr>
                    <tr>
                      <th className="text-center">orderDetails</th>
                      <td className="nested-container">
                        <table className="sub-table">
                          <colgroup>
                            <col className="sub-col-key" />
                            <col className="sub-col-val" />
                          </colgroup>
                          <tbody>
                            <tr>
                              <td>salesCurrency</td>
                              <td>{data.order.order_details.sales_currency}</td>
                            </tr>
                            <tr>
                              <td>salesCountry</td>
                              <td>{data.order.order_details.sales_country}</td>
                            </tr>
                            <tr>
                              <td>salesCountryCode</td>
                              <td>{data.order.order_details.sales_country_code}</td>
                            </tr>
                            <tr>
                              <td>salesPriceGross</td>
                              <td>{nfInt(data.order.order_details.sales_price_gross)}</td>
                            </tr>
                            <tr>
                              <td>salesPriceNet</td>
                              <td>
                                {data.order.order_details.sales_price_net
                                  ? nfInt(data.order.order_details.sales_price_net)
                                  : ""}
                              </td>
                            </tr>
                            <tr>
                              <td>appliedDiscountPercentage</td>
                              <td>{data.order.order_details.applied_discount_percentage}</td>
                            </tr>
                            <tr>
                              <td>appliedDiscountAmount</td>
                              <td>
                                {data.order.order_details.applied_discount_amount
                                  ? nfInt(data.order.order_details.applied_discount_amount)
                                  : ""}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <div className="nested-card">
                          <div className="card-title">priceListDetails</div>
                          <table className="sub-table size-sm">
                            <colgroup>
                              <col className="sub-col-key" />
                              <col className="sub-col-val" />
                            </colgroup>
                            <tbody>
                              <tr>
                                <td>publisherName</td>
                                <td>
                                  {data.order.order_details.price_list_details.publisher_name}
                                </td>
                              </tr>
                              <tr>
                                <td>publisherGuid</td>
                                <td className="text-break">
                                  {data.order.order_details.price_list_details.publisher_guid}
                                </td>
                              </tr>
                              <tr>
                                <td>priceModel</td>
                                <td>{data.order.order_details.price_list_details.price_model}</td>
                              </tr>
                              <tr>
                                <td>priceListGuid</td>
                                <td className="text-break">
                                  {data.order.order_details.price_list_details.price_list_guid}
                                </td>
                              </tr>
                              <tr>
                                <td>countryCode</td>
                                <td>{data.order.order_details.price_list_details.country_code}</td>
                              </tr>
                              <tr>
                                <td>srpCurrency</td>
                                <td>{data.order.order_details.price_list_details.srp_currency}</td>
                              </tr>
                              <tr>
                                <td>purchasePriceCurrency</td>
                                <td>
                                  {
                                    data.order.order_details.price_list_details
                                      .purchase_price_currency
                                  }
                                </td>
                              </tr>
                              <tr>
                                <td>baseSRP</td>
                                <td>
                                  {nfInt(data.order.order_details.price_list_details.base_srp)}
                                </td>
                              </tr>
                              <tr>
                                <td>discountedSRP</td>
                                <td>
                                  {nfInt(
                                    data.order.order_details.price_list_details.discounted_srp,
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>netDiscountedSRP</td>
                                <td>
                                  {nf2(
                                    data.order.order_details.price_list_details.net_discounted_srp,
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>priceListVAT</td>
                                <td>
                                  {data.order.order_details.price_list_details.price_list_vat}
                                </td>
                              </tr>
                              <tr>
                                <td>basePurchasePrice</td>
                                <td>
                                  {nf2(
                                    data.order.order_details.price_list_details.base_purchase_price,
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>promoPercentage</td>
                                <td>
                                  {data.order.order_details.price_list_details.promo_percentage}
                                </td>
                              </tr>
                              <tr>
                                <td>netPurchasePrice</td>
                                <td>
                                  {nf2(
                                    data.order.order_details.price_list_details.net_purchase_price,
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <td>estimatedMargin</td>
                                <td>
                                  {nf2(
                                    data.order.order_details.price_list_details.estimated_margin,
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {searched && data && !data.found && (
        // legacy 버그: 변수 $genba_error(미설정, $vaultn_error 오타) → 항상 빈 접두 그대로 이식.
        <div className="alert alert-danger" role="alert">
          {" : 주문 정보를 찾을 수 없습니다."}
        </div>
      )}
    </>
  );
};
