import { createFileRoute } from "@tanstack/react-router";
import { StatisticsPromotionReportScreen } from "@screens/statistics-promotion-report";
import type { StatPromotionReportSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/promotion/promotion_report.php → /statistics/promotion/promotion_report
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsPromotionReportRoute = () => {
  const search = Route.useSearch();
  return <StatisticsPromotionReportScreen {...search} />;
};

export const Route = createFileRoute("/statistics/promotion/promotion_report")({
  validateSearch: (search: Record<string, unknown>): StatPromotionReportSearch => ({
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_product_platform: str(search.search_product_platform),
    search_supplier_code: str(search.search_supplier_code),
    search_start: str(search.search_start),
    search_end: str(search.search_end),
    search_game_type: str(search.search_game_type),
    page: Number(search.page) || 1,
  }),
  component: StatisticsPromotionReportRoute,
});
