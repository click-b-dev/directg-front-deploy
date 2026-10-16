import { createFileRoute } from "@tanstack/react-router";
import { StatisticsZtormDayCountScreen } from "@screens/statistics-ztorm-day-count";
import type { StatZtormDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_ztorm_day_count.php → /statistics/order/order_ztorm_day_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsZtormDayCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsZtormDayCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_ztorm_day_count")({
  validateSearch: (search: Record<string, unknown>): StatZtormDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_day: str(search.search_day),
  }),
  component: StatisticsZtormDayCountRoute,
});
