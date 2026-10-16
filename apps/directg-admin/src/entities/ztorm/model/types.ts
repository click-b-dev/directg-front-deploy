// legacy goods/ztorm/* — Ztorm API 연동.

// ztorm_ping.php — runPing() 원시 결과(임의 형태 → 덤프 표시).
export type ZtormPingResult = Record<string, unknown>;

// ztorm_publisher_list.php — getZtormPublisher()
export type ZtormPublisherItem = {
  publisher_id: string;
  publisher_name: string;
  cc: number; // 상품수
};
export type ZtormPublisherListResponse = {
  items: ZtormPublisherItem[];
};

// ztorm_catalogue.php — getZtormCatalogue (50/page)
export type ZtormCatalogueSearch = {
  page: number;
};
export type ZtormCatalogueItem = {
  ProductID: string;
  RegionTag: string;
  name: string;
  publisher_id: string;
  publisher_name: string;
  status: string;
  OrderDate: number; // unix
  download_date: number; // unix
  release_date: number; // unix
  rrp: number;
};
export type ZtormPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};
export type ZtormCatalogueResponse = {
  items: ZtormCatalogueItem[];
  pagination: ZtormPagination;
};
export type ZtormActionResult = { success: boolean; message: string };
export type ZtormItemRequest = { zt_item_id: string };

// ztorm_promotion.php — getZtormPromotion (50/page)
export type ZtormPromotionSearch = {
  page: number;
};
export type ZtormPromotionItem = {
  product_code: string;
  product_name: string;
  item_id: string;
  item_name: string;
  item_publisher: string;
  product_srp: number;
  percent: number;
  promotion_start: string;
  promotion_end: string;
};
export type ZtormPromotionResponse = {
  items: ZtormPromotionItem[];
  pagination: ZtormPagination;
};
