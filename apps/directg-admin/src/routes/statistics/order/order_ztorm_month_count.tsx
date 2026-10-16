import { createFileRoute } from "@tanstack/react-router";
import { StatisticsZtormMonthCountScreen } from "@screens/statistics-ztorm-month-count";
import type { StatZtormMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_ztorm_month_count.php → /statistics/order/order_ztorm_month_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsZtormMonthCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsZtormMonthCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_ztorm_month_count")({
  validateSearch: (search: Record<string, unknown>): StatZtormMonthCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsZtormMonthCountRoute,
});
