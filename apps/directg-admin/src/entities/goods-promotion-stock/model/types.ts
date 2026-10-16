// legacy goods/stock/goods_promotion_stock.php — 할인 프로모션 재고현황(진행중 프로모션 상품).
// docs/migration/admin/stock/goods-promotion-stock.md. #155 자매(다운로드·행강조 없음, 프로모션 조인).

export type GoodsPromotionStockSearch = {
  page: number;
  search_key: string;
  search_value: string;
  publisherCd: string;
  productTypeCd: string;
  // UI 없는 dead 필터(GET pass-through, 백엔드가 b.item_type/b.item_platform 매칭).
  assetTypeCd: string;
  platformCd: string;
};

// tbl_goods_item(a) ⋈ tbl_goods_item_delivery(b) ⋈ tbl_promotion_schedule(c, 진행중) 재고 행.
export type GoodsPromotionStockItem = {
  product_code: string;
  product_name: string;
  soldout: string; // "N" | "Y"
  status: string; // "0"(판매중 고정)
  item_id: string;
  item_name: string;
  item_type: string;
  item_platform: string;
  item_publisher: string;
  stock: number;
  update_date: string;
};

export type AssetCodeOption = {
  code_id: string;
  name: string;
};

export type GoodsPromotionStockListResponse = {
  items: GoodsPromotionStockItem[];
  pagination: { total_results: number; total_pages: number };
  codes: {
    publisher: AssetCodeOption[]; // getAssetCodeList('PUBL')
    product_type: AssetCodeOption[]; // 'PDTP'
  };
};

export type GoodsPromotionStockCheckResponse = { success: boolean };
