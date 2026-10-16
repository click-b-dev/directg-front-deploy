// legacy goods/stock/dashboard_stock.php — 재고 대시보드(read-only, docs/migration/admin/stock/dashboard-stock.md).

// 카드1(판매중 & 재고0)·카드3(판매중 아님 & 재고0) 공통 행.
// status/soldout은 원본 코드값 — 프론트가 뱃지·행강조를 판정.
export type StockZeroItem = {
  product_code: string;
  product_name: string;
  status: string; // 카드1은 "0", 카드3은 "1"|"9"
  soldout: string; // "N" | "Y"
  item_id: string;
  item_name: string;
  item_publisher: string;
};

// 카드2(판매중 & 품절, Asset 외). order_system_label은 서버가 완성
// (getOrderSystem 매핑값 · 없으면 raw order_system · null/빈값이면 "-").
export type SellingSoldoutStockItem = {
  product_code: string;
  product_name: string;
  order_system_label: string;
};

export type StockDashboard = {
  selling_stock_zero: StockZeroItem[]; // 카드1: soldout N 먼저 정렬 완료(서버)
  not_selling_stock_zero: StockZeroItem[]; // 카드3: SQL 순서
  selling_soldout: SellingSoldoutStockItem[]; // 카드2
};
