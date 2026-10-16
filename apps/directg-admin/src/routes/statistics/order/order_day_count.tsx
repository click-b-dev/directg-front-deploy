import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderDayCountScreen } from "@screens/statistics-order-day-count";
import type { StatOrderDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_day_count.php → /statistics/order/order_day_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderDayCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderDayCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_day_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsOrderDayCountRoute,
});
