import { createFileRoute } from "@tanstack/react-router";
import { StatisticsVaultnDayCountScreen } from "@screens/statistics-vaultn-day-count";
import type { StatVaultnDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_vaultn_day_count.php → /statistics/order/order_vaultn_day_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsVaultnDayCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsVaultnDayCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_vaultn_day_count")({
  validateSearch: (search: Record<string, unknown>): StatVaultnDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_day: str(search.search_day),
  }),
  component: StatisticsVaultnDayCountRoute,
});
