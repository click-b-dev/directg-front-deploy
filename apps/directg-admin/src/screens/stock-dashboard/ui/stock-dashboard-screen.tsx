import { useEffect } from "react";
import { useStockDashboard } from "@entities/stock-dashboard";
import type { StockZeroItem } from "@entities/stock-dashboard";
import { ProductStatusBadge } from "@shared/ui";

// legacy lib_func 헬퍼 재현(결정적 링크). 대상 페이지 미이관 → 링크 문자열만.
const goodsLink = (code: string) =>
  `/goods/goods_option_view?product_code=${encodeURIComponent(code)}`;
const assetStockLink = (itemId: string) =>
  `/goods/stock/asset_stock?asset_id=${encodeURIComponent(itemId)}`;

// legacy soldout_badge($soldout) — 품절(Y)이면 뱃지, 아니면 없음.
const SoldoutBadge = ({ soldout }: { soldout: string }) =>
  soldout === "Y" ? <span className="badge bg-secondary">품절</span> : null;

// legacy render_stock_rows($list, $admin, $highlight_unsoldout) — 카드1/카드3 공통 4컬럼 행.
// highlight=true면 미품절(soldout≠Y) 행을 table-danger로 강조(카드1만).
const StockZeroRows = ({
  list,
  highlight = false,
}: {
  list: StockZeroItem[];
  highlight?: boolean;
}) => {
  if (list.length === 0) {
    return (
      <tr>
        <td colSpan={4} className="text-center text-muted py-2">
          해당 항목이 없습니다.
        </td>
      </tr>
    );
  }
  return (
    <>
      {list.map((row) => (
        <tr
          key={`${row.product_code}-${row.item_id}`}
          className={highlight && row.soldout !== "Y" ? "table-danger" : undefined}
        >
          <td className="text-center">
            <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
              {row.product_code}
            </a>
          </td>
          <td>
            {row.product_name} <ProductStatusBadge status={row.status} />{" "}
            <SoldoutBadge soldout={row.soldout} />
          </td>
          <td>
            <a href={assetStockLink(row.item_id)} target="_blank" rel="noreferrer">
              [{row.item_id}]
            </a>{" "}
            {row.item_name}
          </td>
          <td>{row.item_publisher}</td>
        </tr>
      ))}
    </>
  );
};

// legacy goods/stock/dashboard_stock.php — 재고 대시보드(read-only, 3카드).
export const StockDashboardScreen = () => {
  useEffect(() => {
    document.title = "재고 대시보드";
  }, []);

  const { data } = useStockDashboard();

  if (!data) {
    return null;
  }

  const { selling_stock_zero, not_selling_stock_zero, selling_soldout } = data;

  return (
    <>
      {/* page title (breadcrumb 없음) */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">재고 대시보드</h4>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <p className="font-12 text-muted mb-2">
            * 재고 기반 카드(Asset)는 동기화된 재고 기준 · 판매종료 제외. 재고 0이어도 자동 품절되지
            않습니다(관리자 수동). 'Asset 외' 카드는 재고와 무관하게 판매중 &amp; 품절 상품을
            표시합니다.
          </p>
        </div>
      </div>

      <div className="row">
        {/* 1순위: 판매중 & 재고 0 (미품절 강조) */}
        <div className="col-lg-6">
          <div className="card border-warning">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Asset &middot; 판매중 &amp; 재고 0</h5>
              <span className="badge bg-dark text-white">
                {selling_stock_zero.length.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-centered w-100 table-sm table-bordered mb-0">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th className="text-center">옵션상품명 / 상태 / 품절여부</th>
                    <th className="text-center">Asset 정보</th>
                    <th className="text-center">Asset 공급처</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  <StockZeroRows list={selling_stock_zero} highlight />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 판매중 & 품절 (재고/Asset 무관, 비Asset 포함) */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Asset 외 &middot; 판매중 &amp; 품절</h5>
              <span className="badge bg-light text-dark">
                {selling_soldout.length.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-centered w-100 table-sm table-bordered mb-0">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th className="text-center">옵션상품명</th>
                    <th className="text-center">배송시스템</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  {selling_soldout.length > 0 ? (
                    selling_soldout.map((row) => (
                      <tr key={row.product_code}>
                        <td className="text-center">
                          <a href={goodsLink(row.product_code)} target="_blank" rel="noreferrer">
                            {row.product_code}
                          </a>
                        </td>
                        <td>{row.product_name}</td>
                        <td className="text-center">{row.order_system_label}</td>
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
            </div>
          </div>
        </div>
      </div>

      {/* 2순위: 판매중 아님 & 재고 0 */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Asset &middot; 판매중 아님 &amp; 재고 0</h5>
              <span className="badge bg-light text-dark">
                {not_selling_stock_zero.length.toLocaleString()} 건
              </span>
            </div>
            <div className="card-body p-1">
              <table className="table table-centered w-100 table-sm table-bordered mb-0">
                <thead className="table-light font-13">
                  <tr>
                    <th className="text-center">옵션상품코드</th>
                    <th className="text-center">옵션상품명 / 상태 / 품절여부</th>
                    <th className="text-center">Asset 정보</th>
                    <th className="text-center">Asset 공급처</th>
                  </tr>
                </thead>
                <tbody className="font-12">
                  <StockZeroRows list={not_selling_stock_zero} />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
