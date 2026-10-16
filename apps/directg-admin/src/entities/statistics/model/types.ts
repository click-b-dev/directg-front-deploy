// legacy pc/_Admin_/statistics/order/order_day_count.php — 일별 주문집계.

export type StatOrderDayCountSearch = {
  search_year: string; // YYYY
  search_month: string; // MM (2자리)
};

export type StatOrderDaySalesBucket = {
  total_count: number;
  total_price: number;
};

export type StatOrderDayItem = {
  ord_ymd: string; // "YYYY-MM-DD"
  preorder: StatOrderDaySalesBucket;
  normal: StatOrderDaySalesBucket;
  promotion: StatOrderDaySalesBucket;
  total_count: number;
  total_price: number;
  batch_date: string; // tbl_sales_log.batch_date, 없으면 ""
};

export type StatOrderDayCountResponse = {
  search_year: string;
  search_month: string;
  // sparse: tbl_sales/tbl_sales_log에 존재하는 일자만. 없는 날은 화면이 0으로 채움.
  days: StatOrderDayItem[];
};

// legacy order_count_batch.php mode=batch_day — 특정 일자 재집계.
export type StatOrderDayBatchRequest = {
  search_year: string;
  ord_ymd: string; // "YYYY-MM-DD"
};

export type StatOrderDayBatchResult = {
  success: boolean;
};

// legacy statistics/order/order_month_count.php — 월별 주문집계(선택 연도의 12개월). 읽기전용.
export type StatOrderMonthCountSearch = {
  search_year: string; // YYYY
};

export type StatOrderMonthItem = {
  order_month: string; // "YYYY-MM"
  preorder: StatOrderDaySalesBucket;
  normal: StatOrderDaySalesBucket;
  promotion: StatOrderDaySalesBucket;
  total_count: number;
  total_price: number;
};

export type StatOrderMonthCountResponse = {
  search_year: string;
  // sparse: tbl_sales에 존재하는 월만. 없는 달은 화면이 0으로 채움.
  months: StatOrderMonthItem[];
};

// legacy statistics/order/order_title_count.php — 대표상품별 주문통계(연/월 기간).
export type StatOrderTitleCountSearch = {
  search_year: string; // YYYY
  search_month: string; // MM, 빈 문자열=연 전체
};

export type StatOrderTitleItem = {
  title_id: string;
  title_name: string;
  game: StatOrderDaySalesBucket;
  edition: StatOrderDaySalesBucket;
  dlc: StatOrderDaySalesBucket;
  sales_count: number; // game+edition+dlc 수량
  sales_price: number; // game+edition+dlc 금액
};

export type StatOrderTitleCountResponse = {
  search_year: string;
  search_month: string;
  // 백엔드 정렬: sales_price DESC, sales_count DESC.
  titles: StatOrderTitleItem[];
};

// legacy title_order_ps.php mode=best_game_save — 인기 타이틀 집계 저장.
export type StatOrderTitleBestSaveRequest = {
  search_year: string;
  search_month: string;
};

export type StatOrderTitleBestSaveResult = {
  success: boolean;
};

// legacy statistics/order/order_goods_count.php — 옵션상품별 주문통계.
export type StatOrderGoodsCountSearch = {
  search_year: string; // YYYY | "all"
  search_product_code: string;
  search_supplier_code: string;
};

// 공급처명 폴백용 raw 컬럼(publisher_name → old_publisher_name '예전DB' → supplier_code).
export type StatGoodsSupplierRow = {
  supplier_code: string;
  publisher_name: string;
  old_publisher_name: string;
};

export type StatGoodsPriceRow = StatGoodsSupplierRow & {
  unit_price: number;
  total_count: number;
};

export type StatGoodsDayRow = StatGoodsSupplierRow & {
  ord_ymd: string;
  unit_price: number;
  total_count: number;
};

export type StatGoodsPromotionRow = {
  promotion_start: string;
  promotion_end: string;
  p_discount_rate: string;
  discount_rate: string;
  sale_price: number;
  order_count: number;
};

export type StatGoodsItemInfo = {
  product_code: string;
  product_name: string;
  display_type: string;
  platform_name: string; // getProductPlatform(product_platform)
  release_date: string; // Y-m-d
  consumer_price: number;
  price: number;
  status: string; // getProductStatus → ProductStatusBadge
};

export type StatOrderGoodsCountResponse = {
  search_year: string;
  search_product_code: string;
  search_supplier_code: string;
  year_label: string; // "전체" | "{year}년"
  show_supplier: boolean; // search_supplier_code === ""
  goods_item: StatGoodsItemInfo | null; // 미등록 상품은 null
  selected_product_name: string; // 미등록 폴백 상품명
  price_stats: StatGoodsPriceRow[];
  day_stats: StatGoodsDayRow[];
  promotion_history: StatGoodsPromotionRow[];
};

// getSalesSupplierList — 공급처 전체 프리로드(select 옵션).
export type StatSalesSupplier = { publisher_code: string; publisher_name: string };
export type StatSalesSupplierListResponse = { suppliers: StatSalesSupplier[] };

// ajax_sales_product.php — 옵션상품 원격검색 결과(select2 {id,text}).
export type StatProductSearchResult = { id: string; text: string };
export type StatProductSearchResponse = { results: StatProductSearchResult[] };

// ajax_product_supplier.php — 선택 상품의 판매 공급처(연동 좁힘, option HTML→JSON).
export type StatProductSupplier = { supplier_code: string; label: string; selected: boolean };
export type StatProductSupplierResponse = { suppliers: StatProductSupplier[] };

// legacy statistics/order/order_publisher_count.php — 공급처별 주문통계(선택 연도).
export type StatOrderPublisherCountSearch = {
  search_year: string; // YYYY
};

export type StatPublisherRow = {
  supplier_code: string;
  publisher_name: string; // 현재 DB 이름(없으면 "")
  old_publisher_name: string; // 예전 DB 이름(없으면 "")
  normal: StatOrderDaySalesBucket;
  promotion: StatOrderDaySalesBucket;
  total_count: number;
  total_price: number;
};

export type StatOrderPublisherCountResponse = {
  search_year: string;
  rows: StatPublisherRow[]; // total_price desc
  grand_total_count: number; // raw 합(비율 분모)
  grand_total_price: number;
};

// legacy statistics/order/order_goods_publisher_count.php — 공급처 - 옵션상품별 주문통계.
export type StatOrderGoodsPublisherCountSearch = {
  search_start_date: string;
  search_end_date: string;
  search_supplier_code: string;
  search_game_type: string; // all/game/dlc/music/bundle
};

export type StatGoodsPublisherRow = {
  supplier_code: string;
  publisher_name: string; // 현재 DB(없으면 "")
  old_publisher_name: string; // 예전 DB(없으면 "")
  game_type: string;
  release_date: string; // 원본(프론트 substr 0,10)
  product_code: string;
  product_name: string;
  total_count: number;
  total_price: number;
};

export type StatOrderGoodsPublisherCountResponse = {
  search_start_date: string;
  search_end_date: string;
  rows: StatGoodsPublisherRow[]; // total_count desc, total_price desc
};

// legacy statistics/order/sales_goods_day.php — 기간별 주문통계(공급처/유형 없음).
export type StatSalesGoodsDaySearch = {
  search_start_date: string;
  search_end_date: string;
};

export type StatSalesDayRow = {
  supplier_code: string;
  publisher_name: string; // 현재 DB(없으면 "")
  old_publisher_name: string; // 예전 DB(없으면 "")
  product_code: string;
  product_name: string;
  total_count: number;
  total_price: number;
};

export type StatSalesGoodsDayResponse = {
  search_start_date: string;
  search_end_date: string;
  rows: StatSalesDayRow[]; // total_count desc, total_price desc
};

// legacy statistics/goods/title_ranking.php — 인기타이틀 순위(tbl_sales_ranking 읽기 뷰).
export type StatTitleRankingSearch = {
  search_year: string; // 빈값=전체
  search_month: string; // 빈값=전체
  page: number;
};

export type StatTitleRankingRow = {
  title_id: string;
  title_name: string;
  publisher: string; // tbl_goods raw
  release_date: string; // tbl_goods raw
  total_count: number; // Game(=game+edition) 수량
  total_price: number;
  dlc_count: number;
  dlc_price: number;
};

export type StatTitleRankingResponse = {
  search_year: string;
  search_month: string;
  items: StatTitleRankingRow[];
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/goods/metacritic_score.php — Metacritic 점수 순위(steam_app_list).
export type StatMetacriticScoreSearch = {
  search_year: string; // 출시연도, 빈값=전체
  page: number;
};

export type StatMetacriticRow = {
  appid: string;
  name: string;
  app_type: string;
  publisher: string;
  release_date: string;
  recommendations: number;
  metacritic_score: number; // raw 표시
  metacritic_url: string;
};

export type StatMetacriticScoreResponse = {
  search_year: string;
  items: StatMetacriticRow[];
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/order/order_asset_day_count.php — Asset 일별 주문현황(50/page).
export type StatAssetDayCountSearch = {
  search_year: string;
  search_month: string;
  search_day: string;
  page: number;
};

export type StatAssetDayRow = {
  asset_id: string;
  asset_name: string;
  publisher: string;
  productType: string;
  assetType: string;
  platform: string;
  total_count: number;
};

export type StatAssetDayCountResponse = {
  search_year: string;
  search_month: string;
  search_day: string;
  items: StatAssetDayRow[];
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/order/order_asset_month_count.php — Asset 월별 주문현황(#237 자매, row 재사용).
export type StatAssetMonthCountSearch = {
  search_year: string;
  search_month: string;
  page: number;
};

export type StatAssetMonthCountResponse = {
  search_year: string;
  search_month: string;
  items: StatAssetDayRow[];
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/order/order_ztorm_day_count.php — Ztorm 일별 주문현황(페이지네이션 없음).
export type StatZtormDayCountSearch = {
  search_year: string;
  search_month: string;
  search_day: string;
};

export type StatZtormDayRow = {
  ztorm_publisher: string;
  ztorm_item_id: string;
  ztorm_item_name: string;
  total_count: number;
  // legacy 쿼리가 SUM 미포함 → 현행상 0(order-ztorm-day-count.md quirk 참조).
  total_gross_amount: number;
  total_net_amount: number;
  total_actual_buying_price: number;
};

export type StatZtormDayCountResponse = {
  search_year: string;
  search_month: string;
  search_day: string;
  items: StatZtormDayRow[]; // count desc
};

// legacy statistics/order/order_ztorm_month_count.php — Ztorm 월별 주문현황(#239 자매, row 재사용).
export type StatZtormMonthCountSearch = {
  search_year: string;
  search_month: string;
};

export type StatZtormMonthCountResponse = {
  search_year: string;
  search_month: string;
  items: StatZtormDayRow[]; // count desc
};

// legacy statistics/order/order_genba_day_count.php — Genba 일별 주문현황(실금액+환산+동기화).
export type StatGenbaDayCountSearch = {
  search_year: string;
  search_month: string;
  search_day: string;
};

export type StatGenbaDayRow = {
  sku: string;
  name: string; // 빈값이면 동기화 버튼 노출
  publisher: string;
  total_count: number;
  total_net_amount: number;
  total_gross_amount: number;
  total_actual_buying_price: number; // RAW(프론트 <300?×1500 환산)
};

export type StatGenbaDayCountResponse = {
  search_year: string;
  search_month: string;
  search_day: string;
  items: StatGenbaDayRow[]; // GrossAmount desc
};

// legacy genba_catalogue_sync.php — Genba 카탈로그 동기화.
export type StatGenbaSyncRequest = { sku: string };
export type StatGenbaSyncResult = { success: boolean };

// legacy statistics/order/order_genba_month_count.php — Genba 월별 주문현황(#241 자매, 동기화 없음·환산<500).
export type StatGenbaMonthCountSearch = {
  search_year: string;
  search_month: string;
};

export type StatGenbaMonthCountResponse = {
  search_year: string;
  search_month: string;
  items: StatGenbaDayRow[]; // GrossAmount desc
};

// legacy statistics/order/genba_publisher_count.php — Genba 퍼블리셔 주문현황(필터 없음).
export type StatGenbaPublisherCountSearch = {
  page: number; // 쿼리 페이징 없음. 번호 offset(num + (page - 1) * 100)에만 사용.
};

export type StatGenbaPublisherRow = {
  publisher: string;
  total_count: number;
  total_net_amount: number;
  total_gross_amount: number;
  total_actual_buying_price: number;
};

export type StatGenbaPublisherCountResponse = {
  page: number;
  items: StatGenbaPublisherRow[]; // GrossAmount desc
};

// legacy statistics/order/genba_total_count.php — Genba 누적 주문현황(30/page).
export type StatGenbaTotalCountSearch = {
  page: number;
};

export type StatGenbaTotalRow = StatGenbaDayRow;

export type StatGenbaTotalCountResponse = {
  page: number;
  items: StatGenbaTotalRow[]; // (NetAmount - ActualBuyingPrice) desc
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/order/order_vaultn_day_count.php — Vaultn 일별 주문현황(실금액+동기화).
export type StatVaultnDayCountSearch = {
  search_year: string;
  search_month: string;
  search_day: string;
};

export type StatVaultnDayRow = {
  sku: string;
  name: string; // 빈값이면 동기화 버튼 노출
  publisher_name: string;
  total_count: number;
  total_gross_amount: number;
  total_net_amount: number;
  total_actual_buying_price: number;
};

export type StatVaultnDayCountResponse = {
  search_year: string;
  search_month: string;
  search_day: string;
  items: StatVaultnDayRow[]; // GrossAmount desc
};

// legacy vaultn_catalogue_sync.php — Vaultn 카탈로그 동기화.
export type StatVaultnSyncRequest = { sku: string };
export type StatVaultnSyncResult = { success: boolean };

// legacy statistics/order/order_vaultn_month_count.php — Vaultn 월별 주문현황(#245 자매).
export type StatVaultnMonthCountSearch = {
  search_year: string;
  search_month: string;
};

export type StatVaultnMonthCountResponse = {
  search_year: string;
  search_month: string;
  items: StatVaultnDayRow[]; // count desc
};

// legacy statistics/order/vaultn_total_count.php — Vaultn 누적 주문현황(100/page).
export type StatVaultnTotalCountSearch = {
  page: number;
};

export type StatVaultnTotalRow = StatVaultnDayRow;

export type StatVaultnTotalCountResponse = {
  page: number;
  items: StatVaultnTotalRow[]; // sum(salesPriceGross-netPurchasePrice) desc
  pagination: { current_page: number; total_pages: number; total_results: number };
};

// legacy statistics/order/order_vaultn_month_count_compare.php — VaultN 월별 주문현황(리포트 비교용).
export type StatVaultnMonthCompareSearch = {
  search_publisher: string; // ""이면 legacy 기본 38
  search_year: string;
  search_month: string;
};

export type StatVaultnMonthCompareRow = {
  ordno: string;
  product_code: string;
  product_name: string;
  status: string;
  publisher_code: string;
  order_date: string;
  sku: string;
  vaultn_status: string;
  reg_date: string;
};

export type StatVaultnMonthCompareResponse = {
  search_publisher: string;
  search_year: string;
  search_month: string;
  items: StatVaultnMonthCompareRow[]; // order_date asc
};

// legacy statistics/order/order_holomodels_count.php — 홀로 모델 주문현황.
export type StatHolomodelsCountSearch = {
  search_year: string;
  search_month: string;
};

export type StatHolomodelsRow = {
  product_code: string;
  product_name: string;
  sales_count: number;
  sales_amount: number;
};

export type StatHolomodelsCountResponse = {
  search_year: string;
  search_month: string;
  items: StatHolomodelsRow[]; // sales_count desc
};

// legacy statistics/sales/sales_day.php — 일별 매출현황.
export type StatSalesDayCountSearch = {
  search_year: string;
  search_month: string;
};

export type StatSalesDayCountRow = {
  order_day: string;
  order_price: number;
  checkout_price: number;
  checkout_count: number;
  emoney: number;
  batch_date: string;
};

export type StatSalesDayCountResponse = {
  search_year: string;
  search_month: string;
  days: StatSalesDayCountRow[]; // sparse; screen fills missing calendar days with 0
};

// legacy statistics/sales/sales_month.php — 월별 매출현황.
export type StatSalesMonthCountSearch = {
  search_year: string;
};

export type StatSalesMonthCountRow = {
  order_month: string;
  order_price: number;
  checkout_price: number;
  checkout_count: number;
  emoney: number;
};

export type StatSalesMonthCountResponse = {
  search_year: string;
  months: StatSalesMonthCountRow[]; // sparse; screen fills 12 calendar months with 0
};

// legacy statistics/sales/sales_pg.php — PG별 결제현황.
export type StatSalesPgCountSearch = {
  search_year: string;
  search_month: string;
};

// tbl_order group by ord_ymd, pg_provider 의 raw 그룹 행.
// 표시 5개(kcp/naverpay/payco/toss/toss_pay) 외 pg_provider(kakao 등)도 포함될 수 있다.
export type StatSalesPgCountRow = {
  ord_ymd: string;
  pg_provider: string;
  checkout_count: number;
  checkout_price: number;
};

export type StatSalesPgCountResponse = {
  search_year: string;
  search_month: string;
  rows: StatSalesPgCountRow[];
};

// legacy statistics/promotion/promotion_report.php — 할인 프로모션 주문통계.
export type StatPromotionReportSearch = {
  search_key: string; // search_name | search_product_code | ""
  search_value: string;
  search_product_platform: string; // DEAD 필터 — 결과 미반영, URL/선택 유지 목적
  search_supplier_code: string;
  search_start: string; // promotion_start 정확 일치
  search_end: string; // promotion_end 정확 일치
  search_game_type: string; // game | dlc | music | bundle | ""
  page: number;
};

export type StatPromotionReportRow = {
  publisher_code: string;
  publisher_name: string; // getPublisherName 해석(없으면 "")
  product_code: string;
  product_name: string;
  promotion_start: string; // "YYYY-MM-DD HH:MM:SS"
  promotion_end: string;
  sale_price: number;
  discount_rate: string; // raw echo(포맷 없음)
  order_count: number | null; // null=미집계, 0=집계됨(판매0), 양수=집계됨
  order_price: number;
};

export type StatPromotionReportResponse = {
  items: StatPromotionReportRow[];
  pagination: { current_page: number; total_pages: number; total_results: number };
};

export type StatPromotionReportSupplier = { publisher_code: string; publisher_name: string };
export type StatPromotionReportSupplierListResponse = {
  suppliers: StatPromotionReportSupplier[];
};

export type StatPromotionBatchRequest = {
  product_code: string;
  promotion_start: string;
  promotion_end: string;
  sale_price: number;
};
export type StatPromotionBatchResult = { success: boolean };
