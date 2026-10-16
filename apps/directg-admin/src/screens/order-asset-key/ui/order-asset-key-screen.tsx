import { useOrderAssetKey, type OrderAssetKeyRow } from "@entities/order";

const BASE_URL = "/order/order_asset_key";

type OrderAssetKeySearch = { ordno: string };

// legacy pc/_Admin_/order/order_asset_key.php — Asset 주문 키 조회(ordno 단건, 관리자 A 권한·비활성 조회).
export const OrderAssetKeyScreen = ({ ordno }: OrderAssetKeySearch) => {
  const searched = ordno !== "";
  const { data } = useOrderAssetKey(ordno);

  return (
    <>
      {/* start page title (breadcrumb 없음, h4만) */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Asset 주문 키 조회</h4>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="row">
        <div className="col-12">
          <p className="font-12 mb-2">
            주문번호(ordno)로 해당 주문의 Asset 키를 조회합니다(tbl_order_item_asset 기준).
            관리자(A) 권한 조회라 <strong>키가 활성화되지 않습니다.</strong>
          </p>
        </div>
      </div>

      {/* 검색 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-2">
              <form className="form-horizontal" method="get" action={BASE_URL}>
                <div className="row g-2">
                  <div className="col-lg-5">
                    <div className="input-group">
                      <span className="input-group-text">주문번호(ordno)</span>
                      <input
                        type="text"
                        className="form-control"
                        name="ordno"
                        placeholder="ordno 입력"
                        defaultValue={ordno}
                        required
                      />
                      <button type="submit" className="btn btn-primary shadow-none">
                        키 조회
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {searched && data && !data.order_info && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning">
              해당 주문번호(ordno = <strong>{ordno}</strong>)의 주문 항목이 없습니다.
            </div>
          </div>
        </div>
      )}

      {searched && data && data.order_info && (
        <>
          {/* 주문 요약 */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-secondary text-white">
                  <h5 className="card-title mb-0">주문 정보</h5>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm table-bordered mb-0">
                    <tbody className="font-13">
                      <tr>
                        <th className="bg-light text-center">주문번호(ordno)</th>
                        <td>{data.order_info.ordno}</td>
                        <th className="bg-light text-center">결제번호(settle_no)</th>
                        <td>{data.order_info.settle_no}</td>
                      </tr>
                      <tr>
                        <th className="bg-light text-center">구매자 ID</th>
                        <td>{data.order_info.m_id}</td>
                        <th className="bg-light text-center">활성화 여부</th>
                        <td>
                          {data.order_info.is_actv === "1" ? (
                            <span className="badge bg-success">활성화</span>
                          ) : (
                            <span className="badge bg-secondary">미활성</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="bg-light text-center">상품</th>
                        <td colSpan={3}>
                          {data.order_info.product_name} ({data.order_info.product_code})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 키 목록 */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Asset 키</h5>
                  <span className="badge bg-light text-dark">{data.key_rows.length} 건</span>
                </div>
                <div className="card-body p-0">
                  <table className="table table-sm table-centered table-bordered mb-0">
                    <thead className="table-dark font-13">
                      <tr>
                        <th className="text-start">상품</th>
                        <th className="text-center text-nowrap">Asset ID</th>
                        <th className="text-center text-nowrap">공급처</th>
                        <th className="text-center text-nowrap">Reserve ID</th>
                        <th className="text-start">키</th>
                        <th className="text-center text-nowrap">활성화</th>
                        <th className="text-center text-nowrap">PO</th>
                      </tr>
                    </thead>
                    <tbody className="font-12 user-select-none">
                      {data.key_rows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-3">
                            이 주문에는 발급된 Asset 키가 없습니다. (다른 키발급 시스템이거나
                            미발급)
                          </td>
                        </tr>
                      ) : (
                        data.key_rows.map((row, idx) => (
                          <OrderAssetKeyRowView key={`${row.reserve_id}-${idx}`} row={row} />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const OrderAssetKeyRowView = ({ row }: { row: OrderAssetKeyRow }) => (
  <tr>
    <td className="text-start">{row.product}</td>
    <td className="text-center text-nowrap">{row.asset_id}</td>
    <td className="text-center text-nowrap">{row.publisher}</td>
    <td className="text-center text-nowrap">{row.reserve_id}</td>
    <td className="text-start">
      {row.key !== null ? (
        <span className="eng fw-bold user-select-all">{row.key}</span>
      ) : (
        <span className="text-danger">조회 실패</span>
      )}
    </td>
    <td className="text-center text-nowrap">
      {row.activated === true ? (
        <>
          <span className="badge bg-success">활성화</span>
          <br />
          <span className="num font-11">{row.activatedDt}</span>
        </>
      ) : row.activated === false ? (
        <span className="badge bg-secondary">미활성</span>
      ) : (
        "-"
      )}
    </td>
    <td className="text-center text-nowrap">
      <span className="eng font-11">{row.po}</span>
    </td>
  </tr>
);
