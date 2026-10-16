import { apiClient } from "@shared/api/client";
import type {
  StatOrderDayCountSearch,
  StatOrderDayCountResponse,
  StatOrderDayBatchRequest,
  StatOrderDayBatchResult,
  StatOrderMonthCountSearch,
  StatOrderMonthCountResponse,
  StatOrderTitleCountSearch,
  StatOrderTitleCountResponse,
  StatOrderTitleBestSaveRequest,
  StatOrderTitleBestSaveResult,
  StatOrderGoodsCountSearch,
  StatOrderGoodsCountResponse,
  StatSalesSupplierListResponse,
  StatProductSearchResponse,
  StatProductSupplierResponse,
  StatOrderPublisherCountSearch,
  StatOrderPublisherCountResponse,
  StatOrderGoodsPublisherCountSearch,
  StatOrderGoodsPublisherCountResponse,
  StatSalesGoodsDaySearch,
  StatSalesGoodsDayResponse,
  StatTitleRankingSearch,
  StatTitleRankingResponse,
  StatMetacriticScoreSearch,
  StatMetacriticScoreResponse,
  StatAssetDayCountSearch,
  StatAssetDayCountResponse,
  StatAssetMonthCountSearch,
  StatAssetMonthCountResponse,
  StatZtormDayCountSearch,
  StatZtormDayCountResponse,
  StatZtormMonthCountSearch,
  StatZtormMonthCountResponse,
  StatGenbaDayCountSearch,
  StatGenbaDayCountResponse,
  StatGenbaSyncRequest,
  StatGenbaSyncResult,
  StatGenbaMonthCountSearch,
  StatGenbaMonthCountResponse,
  StatGenbaPublisherCountSearch,
  StatGenbaPublisherCountResponse,
  StatGenbaTotalCountSearch,
  StatGenbaTotalCountResponse,
  StatVaultnDayCountSearch,
  StatVaultnDayCountResponse,
  StatVaultnSyncRequest,
  StatVaultnSyncResult,
  StatVaultnMonthCountSearch,
  StatVaultnMonthCountResponse,
  StatVaultnTotalCountSearch,
  StatVaultnTotalCountResponse,
  StatVaultnMonthCompareSearch,
  StatVaultnMonthCompareResponse,
  StatHolomodelsCountSearch,
  StatHolomodelsCountResponse,
  StatSalesDayCountSearch,
  StatSalesDayCountResponse,
  StatSalesMonthCountSearch,
  StatSalesMonthCountResponse,
  StatSalesPgCountSearch,
  StatSalesPgCountResponse,
  StatPromotionReportSearch,
  StatPromotionReportResponse,
  StatPromotionReportSupplierListResponse,
  StatPromotionBatchRequest,
  StatPromotionBatchResult,
} from "../model/types";

// legacy statistics/order/order_day_count.php — 일별 주문집계(tbl_sales group by + tbl_sales_log).
export const fetchStatOrderDayCount = (query: StatOrderDayCountSearch) =>
  apiClient.get<StatOrderDayCountResponse>("/admin/statistics/order/day-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/order/order_count_batch.php mode=batch_day — 특정 일자 재집계.
export const runStatOrderDayBatch = (payload: StatOrderDayBatchRequest) =>
  apiClient.post<StatOrderDayBatchResult>("/admin/statistics/order/day-count/batch", payload);

// legacy statistics/order/order_month_count.php — 월별 주문집계(선택 연도).
export const fetchStatOrderMonthCount = (query: StatOrderMonthCountSearch) =>
  apiClient.get<StatOrderMonthCountResponse>("/admin/statistics/order/month-count", {
    searchParams: { search_year: query.search_year },
  });

// legacy statistics/order/order_title_count.php — 대표상품별 주문통계(연/월).
export const fetchStatOrderTitleCount = (query: StatOrderTitleCountSearch) => {
  const searchParams: Record<string, string> = { search_year: query.search_year };
  if (query.search_month !== "") searchParams.search_month = query.search_month;
  return apiClient.get<StatOrderTitleCountResponse>("/admin/statistics/order/title-count", {
    searchParams,
  });
};

// legacy title_order_ps.php mode=best_game_save — 인기 타이틀 집계 저장.
export const runStatOrderTitleBestSave = (payload: StatOrderTitleBestSaveRequest) =>
  apiClient.post<StatOrderTitleBestSaveResult>(
    "/admin/statistics/order/title-count/best-save",
    payload,
  );

// legacy statistics/order/order_goods_count.php — 옵션상품별 주문통계(product_code 있을 때만 데이터).
export const fetchStatOrderGoodsCount = (query: StatOrderGoodsCountSearch) => {
  const searchParams: Record<string, string> = {
    search_year: query.search_year,
    search_product_code: query.search_product_code,
  };
  if (query.search_supplier_code !== "")
    searchParams.search_supplier_code = query.search_supplier_code;
  return apiClient.get<StatOrderGoodsCountResponse>("/admin/statistics/order/goods-count", {
    searchParams,
  });
};

// legacy Admin::getSalesSupplierList — 공급처 전체 프리로드.
export const fetchStatSalesSuppliers = () =>
  apiClient.get<StatSalesSupplierListResponse>("/admin/statistics/order/goods-count/suppliers");

// legacy ajax_sales_product.php — 옵션상품 원격검색(select2).
export const searchStatSalesProducts = (query: { q: string; supplier_code: string }) =>
  apiClient.get<StatProductSearchResponse>("/admin/statistics/order/goods-count/products", {
    searchParams: { q: query.q, supplier_code: query.supplier_code },
  });

// legacy ajax_product_supplier.php — 선택 상품의 판매 공급처(연동 좁힘).
export const fetchStatProductSuppliers = (query: { product_code: string; supplier_code: string }) =>
  apiClient.get<StatProductSupplierResponse>(
    "/admin/statistics/order/goods-count/product-suppliers",
    { searchParams: { product_code: query.product_code, supplier_code: query.supplier_code } },
  );

// legacy statistics/order/order_publisher_count.php — 공급처별 주문통계(선택 연도).
export const fetchStatOrderPublisherCount = (query: StatOrderPublisherCountSearch) =>
  apiClient.get<StatOrderPublisherCountResponse>("/admin/statistics/order/publisher-count", {
    searchParams: { search_year: query.search_year },
  });

// legacy statistics/order/order_goods_publisher_count.php — 공급처-옵션상품별 주문통계.
export const fetchStatOrderGoodsPublisherCount = (query: StatOrderGoodsPublisherCountSearch) => {
  const searchParams: Record<string, string> = {
    search_start_date: query.search_start_date,
    search_end_date: query.search_end_date,
    search_supplier_code: query.search_supplier_code,
  };
  if (query.search_game_type !== "") searchParams.search_game_type = query.search_game_type;
  return apiClient.get<StatOrderGoodsPublisherCountResponse>(
    "/admin/statistics/order/goods-publisher-count",
    { searchParams },
  );
};

// legacy statistics/order/sales_goods_day.php — 기간별 주문통계.
export const fetchStatSalesGoodsDay = (query: StatSalesGoodsDaySearch) =>
  apiClient.get<StatSalesGoodsDayResponse>("/admin/statistics/order/sales-goods-day", {
    searchParams: {
      search_start_date: query.search_start_date,
      search_end_date: query.search_end_date,
    },
  });

// legacy statistics/goods/title_ranking.php — 인기타이틀 순위(50/page).
export const fetchStatTitleRanking = (query: StatTitleRankingSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_year !== "") searchParams.search_year = query.search_year;
  if (query.search_month !== "") searchParams.search_month = query.search_month;
  return apiClient.get<StatTitleRankingResponse>("/admin/statistics/goods/title-ranking", {
    searchParams,
  });
};

// legacy statistics/goods/metacritic_score.php — Metacritic 점수 순위(100/page).
export const fetchStatMetacriticScore = (query: StatMetacriticScoreSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_year !== "") searchParams.search_year = query.search_year;
  return apiClient.get<StatMetacriticScoreResponse>("/admin/statistics/goods/metacritic-score", {
    searchParams,
  });
};

// legacy statistics/order/order_asset_day_count.php — Asset 일별 주문현황(50/page).
export const fetchStatAssetDayCount = (query: StatAssetDayCountSearch) =>
  apiClient.get<StatAssetDayCountResponse>("/admin/statistics/order/asset-day-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
      search_day: query.search_day,
      page: String(query.page),
    },
  });

// legacy statistics/order/order_asset_month_count.php — Asset 월별 주문현황(50/page).
export const fetchStatAssetMonthCount = (query: StatAssetMonthCountSearch) =>
  apiClient.get<StatAssetMonthCountResponse>("/admin/statistics/order/asset-month-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
      page: String(query.page),
    },
  });

// legacy statistics/order/order_ztorm_day_count.php — Ztorm 일별 주문현황.
export const fetchStatZtormDayCount = (query: StatZtormDayCountSearch) =>
  apiClient.get<StatZtormDayCountResponse>("/admin/statistics/order/ztorm-day-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
      search_day: query.search_day,
    },
  });

// legacy statistics/order/order_ztorm_month_count.php — Ztorm 월별 주문현황.
export const fetchStatZtormMonthCount = (query: StatZtormMonthCountSearch) =>
  apiClient.get<StatZtormMonthCountResponse>("/admin/statistics/order/ztorm-month-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/order/order_genba_day_count.php — Genba 일별 주문현황.
export const fetchStatGenbaDayCount = (query: StatGenbaDayCountSearch) =>
  apiClient.get<StatGenbaDayCountResponse>("/admin/statistics/order/genba-day-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
      search_day: query.search_day,
    },
  });

// legacy genba_catalogue_sync.php — Genba 카탈로그 동기화(SKU).
export const runStatGenbaSync = (payload: StatGenbaSyncRequest) =>
  apiClient.post<StatGenbaSyncResult>("/admin/statistics/order/genba-day-count/sync", payload);

// legacy statistics/order/order_genba_month_count.php — Genba 월별 주문현황.
export const fetchStatGenbaMonthCount = (query: StatGenbaMonthCountSearch) =>
  apiClient.get<StatGenbaMonthCountResponse>("/admin/statistics/order/genba-month-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/order/genba_publisher_count.php — Genba 퍼블리셔 주문현황.
export const fetchStatGenbaPublisherCount = (query: StatGenbaPublisherCountSearch) =>
  apiClient.get<StatGenbaPublisherCountResponse>("/admin/statistics/order/genba-publisher-count", {
    searchParams: { page: String(query.page) },
  });

// legacy statistics/order/genba_total_count.php — Genba 누적 주문현황.
export const fetchStatGenbaTotalCount = (query: StatGenbaTotalCountSearch) =>
  apiClient.get<StatGenbaTotalCountResponse>("/admin/statistics/order/genba-total-count", {
    searchParams: { page: String(query.page) },
  });

// legacy statistics/order/order_vaultn_day_count.php — Vaultn 일별 주문현황.
export const fetchStatVaultnDayCount = (query: StatVaultnDayCountSearch) =>
  apiClient.get<StatVaultnDayCountResponse>("/admin/statistics/order/vaultn-day-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
      search_day: query.search_day,
    },
  });

// legacy vaultn_catalogue_sync.php — Vaultn 카탈로그 동기화(SKU).
export const runStatVaultnSync = (payload: StatVaultnSyncRequest) =>
  apiClient.post<StatVaultnSyncResult>("/admin/statistics/order/vaultn-day-count/sync", payload);

// legacy statistics/order/order_vaultn_month_count.php — Vaultn 월별 주문현황.
export const fetchStatVaultnMonthCount = (query: StatVaultnMonthCountSearch) =>
  apiClient.get<StatVaultnMonthCountResponse>("/admin/statistics/order/vaultn-month-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/order/vaultn_total_count.php — Vaultn 누적 주문현황.
export const fetchStatVaultnTotalCount = (query: StatVaultnTotalCountSearch) =>
  apiClient.get<StatVaultnTotalCountResponse>("/admin/statistics/order/vaultn-total-count", {
    searchParams: { page: String(query.page) },
  });

// legacy statistics/order/order_vaultn_month_count_compare.php — VaultN 월별 주문현황(리포트 비교용).
export const fetchStatVaultnMonthCompare = (query: StatVaultnMonthCompareSearch) =>
  apiClient.get<StatVaultnMonthCompareResponse>(
    "/admin/statistics/order/vaultn-month-count-compare",
    {
      searchParams: {
        search_publisher: query.search_publisher,
        search_year: query.search_year,
        search_month: query.search_month,
      },
    },
  );

// legacy statistics/order/order_holomodels_count.php — 홀로 모델 주문현황.
export const fetchStatHolomodelsCount = (query: StatHolomodelsCountSearch) =>
  apiClient.get<StatHolomodelsCountResponse>("/admin/statistics/order/holomodels-count", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/sales/sales_day.php — 일별 매출현황.
export const fetchStatSalesDayCount = (query: StatSalesDayCountSearch) =>
  apiClient.get<StatSalesDayCountResponse>("/admin/statistics/sales/day", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/sales/sales_month.php — 월별 매출현황.
export const fetchStatSalesMonthCount = (query: StatSalesMonthCountSearch) =>
  apiClient.get<StatSalesMonthCountResponse>("/admin/statistics/sales/month", {
    searchParams: {
      search_year: query.search_year,
    },
  });

// legacy statistics/sales/sales_pg.php — PG별 결제현황.
export const fetchStatSalesPgCount = (query: StatSalesPgCountSearch) =>
  apiClient.get<StatSalesPgCountResponse>("/admin/statistics/sales/pg", {
    searchParams: {
      search_year: query.search_year,
      search_month: query.search_month,
    },
  });

// legacy statistics/promotion/promotion_report.php — 할인 프로모션 주문통계.
// search_product_platform은 legacy WHERE 미반영(dead)이나 URL 유지를 위해 그대로 전달한다.
export const fetchStatPromotionReport = (query: StatPromotionReportSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_key !== "") searchParams.search_key = query.search_key;
  if (query.search_value !== "") searchParams.search_value = query.search_value;
  if (query.search_product_platform !== "")
    searchParams.search_product_platform = query.search_product_platform;
  if (query.search_supplier_code !== "")
    searchParams.search_supplier_code = query.search_supplier_code;
  if (query.search_start !== "") searchParams.search_start = query.search_start;
  if (query.search_end !== "") searchParams.search_end = query.search_end;
  if (query.search_game_type !== "") searchParams.search_game_type = query.search_game_type;
  return apiClient.get<StatPromotionReportResponse>("/admin/statistics/promotion/report", {
    searchParams,
  });
};

// legacy Admin::getSupplierList — 공급처 select 목록.
export const fetchStatPromotionReportSuppliers = () =>
  apiClient.get<StatPromotionReportSupplierListResponse>(
    "/admin/statistics/promotion/report/suppliers",
  );

// legacy promotion_sales_batch.php(mode=promotion_all_batch) — 집계.
export const runStatPromotionBatch = (payload: StatPromotionBatchRequest) =>
  apiClient.post<StatPromotionBatchResult>("/admin/statistics/promotion/report/batch", payload);
