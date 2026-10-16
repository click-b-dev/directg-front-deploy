import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchStatOrderDayCount,
  runStatOrderDayBatch,
  fetchStatOrderMonthCount,
  fetchStatOrderTitleCount,
  runStatOrderTitleBestSave,
  fetchStatOrderGoodsCount,
  fetchStatSalesSuppliers,
  fetchStatOrderPublisherCount,
  fetchStatOrderGoodsPublisherCount,
  fetchStatSalesGoodsDay,
  fetchStatTitleRanking,
  fetchStatMetacriticScore,
  fetchStatAssetDayCount,
  fetchStatAssetMonthCount,
  fetchStatZtormDayCount,
  fetchStatZtormMonthCount,
  fetchStatGenbaDayCount,
  runStatGenbaSync,
  fetchStatGenbaMonthCount,
  fetchStatGenbaPublisherCount,
  fetchStatGenbaTotalCount,
  fetchStatVaultnDayCount,
  runStatVaultnSync,
  fetchStatVaultnMonthCount,
  fetchStatVaultnTotalCount,
  fetchStatVaultnMonthCompare,
  fetchStatHolomodelsCount,
  fetchStatSalesDayCount,
  fetchStatSalesMonthCount,
  fetchStatSalesPgCount,
  fetchStatPromotionReport,
  fetchStatPromotionReportSuppliers,
  runStatPromotionBatch,
} from "./fetcher";
import type {
  StatOrderDayCountSearch,
  StatOrderDayBatchRequest,
  StatOrderMonthCountSearch,
  StatOrderTitleCountSearch,
  StatOrderTitleBestSaveRequest,
  StatOrderGoodsCountSearch,
  StatOrderPublisherCountSearch,
  StatOrderGoodsPublisherCountSearch,
  StatSalesGoodsDaySearch,
  StatTitleRankingSearch,
  StatMetacriticScoreSearch,
  StatAssetDayCountSearch,
  StatAssetMonthCountSearch,
  StatZtormDayCountSearch,
  StatZtormMonthCountSearch,
  StatGenbaDayCountSearch,
  StatGenbaSyncRequest,
  StatGenbaMonthCountSearch,
  StatGenbaPublisherCountSearch,
  StatGenbaTotalCountSearch,
  StatVaultnDayCountSearch,
  StatVaultnSyncRequest,
  StatVaultnMonthCountSearch,
  StatVaultnTotalCountSearch,
  StatVaultnMonthCompareSearch,
  StatHolomodelsCountSearch,
  StatSalesDayCountSearch,
  StatSalesMonthCountSearch,
  StatSalesPgCountSearch,
  StatPromotionReportSearch,
  StatPromotionBatchRequest,
} from "../model/types";

const STATISTICS_KEY = ["admin", "statistics"] as const;
const STAT_ORDER_DAY_KEY = [...STATISTICS_KEY, "order", "day-count"] as const;
const STAT_ORDER_MONTH_KEY = [...STATISTICS_KEY, "order", "month-count"] as const;
const STAT_ORDER_TITLE_KEY = [...STATISTICS_KEY, "order", "title-count"] as const;
const STAT_ORDER_GOODS_KEY = [...STATISTICS_KEY, "order", "goods-count"] as const;
const STAT_ORDER_PUBLISHER_KEY = [...STATISTICS_KEY, "order", "publisher-count"] as const;
const STAT_ORDER_GOODS_PUBLISHER_KEY = [
  ...STATISTICS_KEY,
  "order",
  "goods-publisher-count",
] as const;
const STAT_SALES_GOODS_DAY_KEY = [...STATISTICS_KEY, "order", "sales-goods-day"] as const;
const STAT_TITLE_RANKING_KEY = [...STATISTICS_KEY, "goods", "title-ranking"] as const;
const STAT_METACRITIC_KEY = [...STATISTICS_KEY, "goods", "metacritic-score"] as const;
const STAT_ASSET_DAY_KEY = [...STATISTICS_KEY, "order", "asset-day-count"] as const;
const STAT_ASSET_MONTH_KEY = [...STATISTICS_KEY, "order", "asset-month-count"] as const;
const STAT_ZTORM_DAY_KEY = [...STATISTICS_KEY, "order", "ztorm-day-count"] as const;
const STAT_ZTORM_MONTH_KEY = [...STATISTICS_KEY, "order", "ztorm-month-count"] as const;
const STAT_GENBA_DAY_KEY = [...STATISTICS_KEY, "order", "genba-day-count"] as const;
const STAT_GENBA_MONTH_KEY = [...STATISTICS_KEY, "order", "genba-month-count"] as const;
const STAT_GENBA_PUBLISHER_KEY = [...STATISTICS_KEY, "order", "genba-publisher-count"] as const;
const STAT_GENBA_TOTAL_KEY = [...STATISTICS_KEY, "order", "genba-total-count"] as const;
const STAT_VAULTN_DAY_KEY = [...STATISTICS_KEY, "order", "vaultn-day-count"] as const;
const STAT_VAULTN_MONTH_KEY = [...STATISTICS_KEY, "order", "vaultn-month-count"] as const;
const STAT_VAULTN_TOTAL_KEY = [...STATISTICS_KEY, "order", "vaultn-total-count"] as const;
const STAT_VAULTN_MONTH_COMPARE_KEY = [
  ...STATISTICS_KEY,
  "order",
  "vaultn-month-count-compare",
] as const;
const STAT_HOLOMODELS_KEY = [...STATISTICS_KEY, "order", "holomodels-count"] as const;
const STAT_SALES_DAY_COUNT_KEY = [...STATISTICS_KEY, "sales", "day"] as const;
const STAT_SALES_MONTH_COUNT_KEY = [...STATISTICS_KEY, "sales", "month"] as const;
const STAT_SALES_PG_COUNT_KEY = [...STATISTICS_KEY, "sales", "pg"] as const;
const STAT_PROMOTION_REPORT_KEY = [...STATISTICS_KEY, "promotion", "report"] as const;
const STAT_PROMOTION_REPORT_SUPPLIERS_KEY = [
  ...STATISTICS_KEY,
  "promotion",
  "report",
  "suppliers",
] as const;

export const statOrderDayCountQueryKey = (query: StatOrderDayCountSearch) =>
  [...STAT_ORDER_DAY_KEY, query] as const;

// legacy statistics/order/order_day_count.php — 일별 주문집계.
export const useStatOrderDayCount = (query: StatOrderDayCountSearch) =>
  useQuery({
    queryKey: statOrderDayCountQueryKey(query),
    queryFn: () => fetchStatOrderDayCount(query),
  });

// legacy order_count_batch.php → success: location.reload() = day-count 재조회(invalidate).
export const useRunStatOrderDayBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: StatOrderDayBatchRequest) => runStatOrderDayBatch(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAT_ORDER_DAY_KEY }),
  });
};

export const statOrderMonthCountQueryKey = (query: StatOrderMonthCountSearch) =>
  [...STAT_ORDER_MONTH_KEY, query] as const;

// legacy statistics/order/order_month_count.php — 월별 주문집계(읽기전용).
export const useStatOrderMonthCount = (query: StatOrderMonthCountSearch) =>
  useQuery({
    queryKey: statOrderMonthCountQueryKey(query),
    queryFn: () => fetchStatOrderMonthCount(query),
  });

export const statOrderTitleCountQueryKey = (query: StatOrderTitleCountSearch) =>
  [...STAT_ORDER_TITLE_KEY, query] as const;

// legacy statistics/order/order_title_count.php — 대표상품별 주문통계.
export const useStatOrderTitleCount = (query: StatOrderTitleCountSearch) =>
  useQuery({
    queryKey: statOrderTitleCountQueryKey(query),
    queryFn: () => fetchStatOrderTitleCount(query),
  });

// legacy title_order_ps.php best_game_save → success: alert만, reload 주석 = invalidate 없음.
export const useRunStatOrderTitleBestSave = () =>
  useMutation({
    mutationFn: (p: StatOrderTitleBestSaveRequest) => runStatOrderTitleBestSave(p),
  });

export const statOrderGoodsCountQueryKey = (query: StatOrderGoodsCountSearch) =>
  [...STAT_ORDER_GOODS_KEY, query] as const;

// legacy statistics/order/order_goods_count.php — 옵션상품별 주문통계(product_code 있을 때만).
export const useStatOrderGoodsCount = (query: StatOrderGoodsCountSearch) =>
  useQuery({
    queryKey: statOrderGoodsCountQueryKey(query),
    queryFn: () => fetchStatOrderGoodsCount(query),
    enabled: query.search_product_code !== "",
  });

// legacy Admin::getSalesSupplierList — 공급처 전체 프리로드.
export const useStatSalesSuppliers = () =>
  useQuery({
    queryKey: [...STAT_ORDER_GOODS_KEY, "suppliers"] as const,
    queryFn: () => fetchStatSalesSuppliers(),
  });

export const statOrderPublisherCountQueryKey = (query: StatOrderPublisherCountSearch) =>
  [...STAT_ORDER_PUBLISHER_KEY, query] as const;

// legacy statistics/order/order_publisher_count.php — 공급처별 주문통계.
export const useStatOrderPublisherCount = (query: StatOrderPublisherCountSearch) =>
  useQuery({
    queryKey: statOrderPublisherCountQueryKey(query),
    queryFn: () => fetchStatOrderPublisherCount(query),
  });

export const statOrderGoodsPublisherCountQueryKey = (query: StatOrderGoodsPublisherCountSearch) =>
  [...STAT_ORDER_GOODS_PUBLISHER_KEY, query] as const;

// legacy statistics/order/order_goods_publisher_count.php — 공급처-옵션상품별(공급처 선택 시만).
export const useStatOrderGoodsPublisherCount = (query: StatOrderGoodsPublisherCountSearch) =>
  useQuery({
    queryKey: statOrderGoodsPublisherCountQueryKey(query),
    queryFn: () => fetchStatOrderGoodsPublisherCount(query),
    enabled: query.search_supplier_code !== "",
  });

export const statSalesGoodsDayQueryKey = (query: StatSalesGoodsDaySearch) =>
  [...STAT_SALES_GOODS_DAY_KEY, query] as const;

// legacy statistics/order/sales_goods_day.php — 기간별 주문통계(항상 로드).
export const useStatSalesGoodsDay = (query: StatSalesGoodsDaySearch) =>
  useQuery({
    queryKey: statSalesGoodsDayQueryKey(query),
    queryFn: () => fetchStatSalesGoodsDay(query),
  });

export const statTitleRankingQueryKey = (query: StatTitleRankingSearch) =>
  [...STAT_TITLE_RANKING_KEY, query] as const;

// legacy statistics/goods/title_ranking.php — 인기타이틀 순위(50/page).
export const useStatTitleRanking = (query: StatTitleRankingSearch) =>
  useQuery({
    queryKey: statTitleRankingQueryKey(query),
    queryFn: () => fetchStatTitleRanking(query),
  });

// legacy title_ranking.php best_game_save → success: alert + location.reload() = 랭킹 invalidate.
export const useRunStatTitleBestSaveReload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: StatOrderTitleBestSaveRequest) => runStatOrderTitleBestSave(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAT_TITLE_RANKING_KEY }),
  });
};

export const statMetacriticScoreQueryKey = (query: StatMetacriticScoreSearch) =>
  [...STAT_METACRITIC_KEY, query] as const;

// legacy statistics/goods/metacritic_score.php — Metacritic 점수 순위(100/page).
export const useStatMetacriticScore = (query: StatMetacriticScoreSearch) =>
  useQuery({
    queryKey: statMetacriticScoreQueryKey(query),
    queryFn: () => fetchStatMetacriticScore(query),
  });

export const statAssetDayCountQueryKey = (query: StatAssetDayCountSearch) =>
  [...STAT_ASSET_DAY_KEY, query] as const;

// legacy statistics/order/order_asset_day_count.php — Asset 일별 주문현황(50/page).
export const useStatAssetDayCount = (query: StatAssetDayCountSearch) =>
  useQuery({
    queryKey: statAssetDayCountQueryKey(query),
    queryFn: () => fetchStatAssetDayCount(query),
  });

export const statAssetMonthCountQueryKey = (query: StatAssetMonthCountSearch) =>
  [...STAT_ASSET_MONTH_KEY, query] as const;

// legacy statistics/order/order_asset_month_count.php — Asset 월별 주문현황(50/page).
export const useStatAssetMonthCount = (query: StatAssetMonthCountSearch) =>
  useQuery({
    queryKey: statAssetMonthCountQueryKey(query),
    queryFn: () => fetchStatAssetMonthCount(query),
  });

export const statZtormDayCountQueryKey = (query: StatZtormDayCountSearch) =>
  [...STAT_ZTORM_DAY_KEY, query] as const;

// legacy statistics/order/order_ztorm_day_count.php — Ztorm 일별 주문현황.
export const useStatZtormDayCount = (query: StatZtormDayCountSearch) =>
  useQuery({
    queryKey: statZtormDayCountQueryKey(query),
    queryFn: () => fetchStatZtormDayCount(query),
  });

export const statZtormMonthCountQueryKey = (query: StatZtormMonthCountSearch) =>
  [...STAT_ZTORM_MONTH_KEY, query] as const;

// legacy statistics/order/order_ztorm_month_count.php — Ztorm 월별 주문현황.
export const useStatZtormMonthCount = (query: StatZtormMonthCountSearch) =>
  useQuery({
    queryKey: statZtormMonthCountQueryKey(query),
    queryFn: () => fetchStatZtormMonthCount(query),
  });

export const statGenbaDayCountQueryKey = (query: StatGenbaDayCountSearch) =>
  [...STAT_GENBA_DAY_KEY, query] as const;

// legacy statistics/order/order_genba_day_count.php — Genba 일별 주문현황.
export const useStatGenbaDayCount = (query: StatGenbaDayCountSearch) =>
  useQuery({
    queryKey: statGenbaDayCountQueryKey(query),
    queryFn: () => fetchStatGenbaDayCount(query),
  });

// legacy genba_catalogue_sync.php → success: location.reload() = genba day-count invalidate.
export const useRunStatGenbaSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: StatGenbaSyncRequest) => runStatGenbaSync(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAT_GENBA_DAY_KEY }),
  });
};

export const statGenbaMonthCountQueryKey = (query: StatGenbaMonthCountSearch) =>
  [...STAT_GENBA_MONTH_KEY, query] as const;

// legacy statistics/order/order_genba_month_count.php — Genba 월별 주문현황.
export const useStatGenbaMonthCount = (query: StatGenbaMonthCountSearch) =>
  useQuery({
    queryKey: statGenbaMonthCountQueryKey(query),
    queryFn: () => fetchStatGenbaMonthCount(query),
  });

export const statGenbaPublisherCountQueryKey = (query: StatGenbaPublisherCountSearch) =>
  [...STAT_GENBA_PUBLISHER_KEY, query] as const;

// legacy statistics/order/genba_publisher_count.php — Genba 퍼블리셔 주문현황.
export const useStatGenbaPublisherCount = (query: StatGenbaPublisherCountSearch) =>
  useQuery({
    queryKey: statGenbaPublisherCountQueryKey(query),
    queryFn: () => fetchStatGenbaPublisherCount(query),
  });

export const statGenbaTotalCountQueryKey = (query: StatGenbaTotalCountSearch) =>
  [...STAT_GENBA_TOTAL_KEY, query] as const;

// legacy statistics/order/genba_total_count.php — Genba 누적 주문현황.
export const useStatGenbaTotalCount = (query: StatGenbaTotalCountSearch) =>
  useQuery({
    queryKey: statGenbaTotalCountQueryKey(query),
    queryFn: () => fetchStatGenbaTotalCount(query),
  });

export const statVaultnDayCountQueryKey = (query: StatVaultnDayCountSearch) =>
  [...STAT_VAULTN_DAY_KEY, query] as const;

// legacy statistics/order/order_vaultn_day_count.php — Vaultn 일별 주문현황.
export const useStatVaultnDayCount = (query: StatVaultnDayCountSearch) =>
  useQuery({
    queryKey: statVaultnDayCountQueryKey(query),
    queryFn: () => fetchStatVaultnDayCount(query),
  });

// legacy vaultn_catalogue_sync.php → success: location.reload() = vaultn day-count invalidate.
export const useRunStatVaultnSync = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: StatVaultnSyncRequest) => runStatVaultnSync(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAT_VAULTN_DAY_KEY }),
  });
};

export const statVaultnMonthCountQueryKey = (query: StatVaultnMonthCountSearch) =>
  [...STAT_VAULTN_MONTH_KEY, query] as const;

// legacy statistics/order/order_vaultn_month_count.php — Vaultn 월별 주문현황.
export const useStatVaultnMonthCount = (query: StatVaultnMonthCountSearch) =>
  useQuery({
    queryKey: statVaultnMonthCountQueryKey(query),
    queryFn: () => fetchStatVaultnMonthCount(query),
  });

export const statVaultnTotalCountQueryKey = (query: StatVaultnTotalCountSearch) =>
  [...STAT_VAULTN_TOTAL_KEY, query] as const;

// legacy statistics/order/vaultn_total_count.php — Vaultn 누적 주문현황.
export const useStatVaultnTotalCount = (query: StatVaultnTotalCountSearch) =>
  useQuery({
    queryKey: statVaultnTotalCountQueryKey(query),
    queryFn: () => fetchStatVaultnTotalCount(query),
  });

export const statVaultnMonthCompareQueryKey = (query: StatVaultnMonthCompareSearch) =>
  [...STAT_VAULTN_MONTH_COMPARE_KEY, query] as const;

// legacy statistics/order/order_vaultn_month_count_compare.php — VaultN 월별 주문현황(리포트 비교용).
export const useStatVaultnMonthCompare = (query: StatVaultnMonthCompareSearch) =>
  useQuery({
    queryKey: statVaultnMonthCompareQueryKey(query),
    queryFn: () => fetchStatVaultnMonthCompare(query),
  });

export const statHolomodelsCountQueryKey = (query: StatHolomodelsCountSearch) =>
  [...STAT_HOLOMODELS_KEY, query] as const;

// legacy statistics/order/order_holomodels_count.php — 홀로 모델 주문현황.
export const useStatHolomodelsCount = (query: StatHolomodelsCountSearch) =>
  useQuery({
    queryKey: statHolomodelsCountQueryKey(query),
    queryFn: () => fetchStatHolomodelsCount(query),
  });

export const statSalesDayCountQueryKey = (query: StatSalesDayCountSearch) =>
  [...STAT_SALES_DAY_COUNT_KEY, query] as const;

// legacy statistics/sales/sales_day.php — 일별 매출현황.
export const useStatSalesDayCount = (query: StatSalesDayCountSearch) =>
  useQuery({
    queryKey: statSalesDayCountQueryKey(query),
    queryFn: () => fetchStatSalesDayCount(query),
  });

export const statSalesMonthCountQueryKey = (query: StatSalesMonthCountSearch) =>
  [...STAT_SALES_MONTH_COUNT_KEY, query] as const;

// legacy statistics/sales/sales_month.php — 월별 매출현황.
export const useStatSalesMonthCount = (query: StatSalesMonthCountSearch) =>
  useQuery({
    queryKey: statSalesMonthCountQueryKey(query),
    queryFn: () => fetchStatSalesMonthCount(query),
  });

export const statSalesPgCountQueryKey = (query: StatSalesPgCountSearch) =>
  [...STAT_SALES_PG_COUNT_KEY, query] as const;

// legacy statistics/sales/sales_pg.php — PG별 결제현황.
export const useStatSalesPgCount = (query: StatSalesPgCountSearch) =>
  useQuery({
    queryKey: statSalesPgCountQueryKey(query),
    queryFn: () => fetchStatSalesPgCount(query),
  });

export const statPromotionReportQueryKey = (query: StatPromotionReportSearch) =>
  [...STAT_PROMOTION_REPORT_KEY, query] as const;

// legacy statistics/promotion/promotion_report.php — 할인 프로모션 주문통계.
export const useStatPromotionReport = (query: StatPromotionReportSearch) =>
  useQuery({
    queryKey: statPromotionReportQueryKey(query),
    queryFn: () => fetchStatPromotionReport(query),
  });

// legacy Admin::getSupplierList — 공급처 select 목록.
export const useStatPromotionReportSuppliers = () =>
  useQuery({
    queryKey: STAT_PROMOTION_REPORT_SUPPLIERS_KEY,
    queryFn: fetchStatPromotionReportSuppliers,
  });

// legacy promotion_sales_batch.php — 집계 후 목록 invalidate(=reload).
export const useRunStatPromotionBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: StatPromotionBatchRequest) => runStatPromotionBatch(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAT_PROMOTION_REPORT_KEY }),
  });
};
