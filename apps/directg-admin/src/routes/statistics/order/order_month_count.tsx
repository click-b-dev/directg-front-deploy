import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderMonthCountScreen } from "@screens/statistics-order-month-count";
import type { StatOrderMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_month_count.php → /statistics/order/order_month_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderMonthCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderMonthCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_month_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderMonthCountSearch => ({
    search_year: str(search.search_year),
  }),
  component: StatisticsOrderMonthCountRoute,
});
