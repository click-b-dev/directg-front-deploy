import { createFileRoute } from "@tanstack/react-router";
import { StatisticsGenbaMonthCountScreen } from "@screens/statistics-genba-month-count";
import type { StatGenbaMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_genba_month_count.php → /statistics/order/order_genba_month_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsGenbaMonthCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsGenbaMonthCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_genba_month_count")({
  validateSearch: (search: Record<string, unknown>): StatGenbaMonthCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsGenbaMonthCountRoute,
});
