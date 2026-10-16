import { useEffect } from "react";
import { useGoodsDashboard } from "@entities/goods-dashboard";

// legacy lib_func 헬퍼 재현(결정적 링크). 대상 페이지 미이관 → 링크만.
const goodsLink = (code: string) =>
  `/goods/goods_option_view?product_code=${encodeURIComponent(code)}`;
const assetLink = (itemId: string) =>
  `/goods/stock/goods_option_stock?search_key=search_asset_id&search_value=${encodeURIComponent(itemId)}`;

// legacy goods/dashboard_goods.php — 상품 모니터링 대시보드(read-only, 6패널).
export const GoodsDashboardScreen = () => {
  useEffect(() => {
    document.title = "상품 대시보드";
  }, []);

  const { data } = useGoodsDashboard();

  if (!data) {
    return null;
  }

  const {
    selling_soldout,
    stock_soldout,
    issue_price,
    issue_delivery,
    promo,
    promo_notselling,
    preorder_list,
  } = data;

  return (
    <>
      {/* page title (breadcrumb 없음) */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">상품 대시보드</h4>
          </div>
        </div>
      </div>

      {/* 1. 재고 알림 */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <h5 className="mb-0">
              <i className="mdi mdi-package-variant" /> 재고 알림{" "}
              <span className="font-12 fw-normal text-muted">
                (판매종료 제외 · 자동 품절 안 함 · 오른쪽 재고 카드는 Asset 기준)
              </span>
            </h5>
            <a href="/goods/stock/dashboard_stock" className="btn btn-sm btn-dark shadow-none">
              재고 대시보드
            </a>
          </div>
        </div>

        {/* 1-1. 판매중 & 품절 */}
        <div className="col-lg-6">
          <div className="card border-warning">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">판매중 &amp; 품절</h5>
              <span className="badge bg-dark text-white">
                {selling_soldout.total.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th>옵션상품명</th>
                    <th className="text-center">오더시스템</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {selling_soldout.items.length > 0 ? (
                    selling_soldout.items.map((row) => (
                      <tr
                        key={row.product_code}
                        className={row.promo_active > 0 ? "table-danger" : undefined}
                      >
                        <td className="text-center">
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_code}
                          </a>
                        </td>
                        <td>
                          {row.product_name}
                          {row.promo_active > 0 && (
                            <span className="badge bg-danger"> 프로모션중</span>
                          )}
                        </td>
                        <td className="text-center">
                          {row.stock_check_link ? (
                            <a
                              href={row.stock_check_link}
                              target="_blank"
                              rel="noreferrer"
                              title="재고체크"
                            >
                              {row.order_system_label}
                            </a>
                          ) : (
                            row.order_system_label
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-2">
                        해당 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {selling_soldout.total > 15 && (
                <p className="font-12 text-muted mt-1 mb-0">
                  외 {(selling_soldout.total - 15).toLocaleString()}건 더 있음
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 1-2. 재고 있는데 품절 처리됨 */}
        <div className="col-lg-6">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">재고 있는데 품절 처리됨</h5>
              <span className="badge bg-light text-dark">
                {stock_soldout.total.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <p className="font-12 text-muted px-1 mb-1">
                재고가 있으므로 <b>품절 해제 후보</b>
              </p>
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center text-nowrap">옵션상품코드</th>
                    <th>옵션상품명</th>
                    <th>Asset</th>
                    <th className="text-center">재고</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {stock_soldout.items.length > 0 ? (
                    stock_soldout.items.map((row) => (
                      <tr key={row.product_code} className="table-info">
                        <td className="text-center">
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_code}
                          </a>
                        </td>
                        <td>
                          {row.product_name}
                          {row.promo_active > 0 && (
                            <span className="badge bg-danger"> 프로모션중</span>
                          )}
                        </td>
                        <td>
                          <a href={assetLink(row.item_id)} target="_blank" rel="noreferrer">
                            [{row.item_id}]
                          </a>{" "}
                          {row.item_name}
                        </td>
                        <td className="text-center fw-bold">{row.stock.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-2">
                        해당 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {stock_soldout.total > 15 && (
                <p className="font-12 text-muted mt-1 mb-0">
                  외 {(stock_soldout.total - 15).toLocaleString()}건 더 있음
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. 등록 품질 점검 */}
      <div className="row">
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">판매중 · 판매가 미설정</h5>
              <span className="badge bg-light text-dark">
                {issue_price.total.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th>옵션상품명</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {issue_price.items.length > 0 ? (
                    issue_price.items.map((row) => (
                      <tr key={row.product_code}>
                        <td className="text-center">
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_code}
                          </a>
                        </td>
                        <td>{row.product_name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="text-center text-muted py-2">
                        해당 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {issue_price.total > 12 && (
                <p className="font-12 text-muted mt-1 mb-0">
                  외 {(issue_price.total - 12).toLocaleString()}건 더 있음 (상위 100건 기준)
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">판매중 디지털 · 배송시스템 미설정</h5>
              <span className="badge bg-light text-dark">
                {issue_delivery.total.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th>옵션상품명</th>
                    <th className="text-center">유형</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {issue_delivery.items.length > 0 ? (
                    issue_delivery.items.map((row) => (
                      <tr key={row.product_code}>
                        <td className="text-center">
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_code}
                          </a>
                        </td>
                        <td>{row.product_name}</td>
                        <td className="text-center">{row.game_type_label}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-2">
                        해당 항목이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {issue_delivery.total > 12 && (
                <p className="font-12 text-muted mt-1 mb-0">
                  외 {(issue_delivery.total - 12).toLocaleString()}건 더 있음 (상위 100건 기준)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 프로모션 / 일정 */}
      <div className="row">
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h5 className="card-title mb-0">프로모션 현황</h5>
            </div>
            <div className="card-body p-2">
              <div className="row text-center g-2">
                <div className="col-4">
                  <div className="border rounded py-3">
                    <div className="font-12 text-muted mb-1">진행예정</div>
                    <h3 className="mb-0 text-primary">{promo.upcoming.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded py-3 bg-light">
                    <div className="font-12 text-muted mb-1">진행중</div>
                    <h3 className="mb-0 text-success">{promo.active.toLocaleString()}</h3>
                  </div>
                </div>
                <div className="col-4">
                  <div className="border rounded py-3">
                    <div className="font-12 text-muted mb-1">
                      종료예정 <span className="font-11">(7일내)</span>
                    </div>
                    <h3 className="mb-0 text-danger">{promo.ending.toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              {promo_notselling.length > 0 && (
                <div className="mt-2">
                  <p className="font-12 fw-bold text-danger mb-1">
                    ⚠ 프로모션 진행중인데 판매중 아님 ({promo_notselling.length})
                  </p>
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light font-12">
                      <tr>
                        <th className="text-center">옵션상품코드</th>
                        <th>옵션상품명</th>
                        <th className="text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody className="font-12">
                      {promo_notselling.map((row) => (
                        <tr key={row.product_code} className="table-warning">
                          <td className="text-center">
                            <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                              {row.product_code}
                            </a>
                          </td>
                          <td>{row.product_name}</td>
                          <td className="text-center">{row.status_label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">예약구매 (출시 임박순)</h5>
              <span className="badge bg-light text-dark">
                {preorder_list.length.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-sm table-bordered mb-0">
                <thead className="table-light font-12">
                  <tr>
                    <th>옵션상품명</th>
                    <th className="text-center">출시일</th>
                    <th className="text-center">배송시스템</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {preorder_list.length > 0 ? (
                    preorder_list.map((row) => (
                      <tr key={row.product_code}>
                        <td>
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_name}
                          </a>
                        </td>
                        <td className="text-center text-nowrap">{row.release_date.slice(0, 10)}</td>
                        <td className="text-center">{row.order_system_label}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center text-muted py-2">
                        없음
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
