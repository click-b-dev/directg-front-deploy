// legacy goods/dashboard_goods.php — 상품 모니터링 대시보드(read-only, docs/migration/admin/goods/dashboard-goods.md).

export type SellingSoldoutItem = {
  product_code: string;
  product_name: string;
  order_system_label: string;
  stock_check_link: string; // 빈값이면 링크 없음
  promo_active: number; // >0이면 프로모션중
};

export type StockSoldoutItem = {
  product_code: string;
  product_name: string;
  item_id: string;
  item_name: string;
  stock: number;
  promo_active: number;
};

export type IssuePriceItem = { product_code: string; product_name: string };

export type IssueDeliveryItem = {
  product_code: string;
  product_name: string;
  game_type_label: string;
};

export type PromoNotSellingItem = {
  product_code: string;
  product_name: string;
  status_label: string;
};

export type PreorderItem = {
  product_code: string;
  product_name: string;
  release_date: string;
  order_system_label: string;
};

// top N만 items에 담고 total은 전체 건수("외 N건" 계산용).
export type PanelWithTotal<T> = { total: number; items: T[] };

export type GoodsDashboard = {
  selling_soldout: PanelWithTotal<SellingSoldoutItem>;
  stock_soldout: PanelWithTotal<StockSoldoutItem>;
  issue_price: PanelWithTotal<IssuePriceItem>;
  issue_delivery: PanelWithTotal<IssueDeliveryItem>;
  promo: { upcoming: number; active: number; ending: number };
  promo_notselling: PromoNotSellingItem[];
  preorder_list: PreorderItem[];
};
