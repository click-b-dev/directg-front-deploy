import { createFileRoute } from "@tanstack/react-router";
import { StatisticsVaultnMonthCountScreen } from "@screens/statistics-vaultn-month-count";
import type { StatVaultnMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_vaultn_month_count.php → /statistics/order/order_vaultn_month_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsVaultnMonthCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsVaultnMonthCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_vaultn_month_count")({
  validateSearch: (search: Record<string, unknown>): StatVaultnMonthCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsVaultnMonthCountRoute,
});
