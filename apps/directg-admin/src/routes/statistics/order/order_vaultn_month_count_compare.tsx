import { createFileRoute } from "@tanstack/react-router";
import { StatisticsVaultnMonthCountCompareScreen } from "@screens/statistics-vaultn-month-count-compare";
import type { StatVaultnMonthCompareSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_vaultn_month_count_compare.php → /statistics/order/order_vaultn_month_count_compare
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsVaultnMonthCountCompareRoute = () => {
  const search = Route.useSearch();
  return <StatisticsVaultnMonthCountCompareScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_vaultn_month_count_compare")({
  validateSearch: (search: Record<string, unknown>): StatVaultnMonthCompareSearch => ({
    search_publisher: str(search.search_publisher),
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsVaultnMonthCountCompareRoute,
});
