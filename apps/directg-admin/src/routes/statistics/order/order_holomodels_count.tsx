import { createFileRoute } from "@tanstack/react-router";
import { StatisticsHolomodelsCountScreen } from "@screens/statistics-holomodels-count";
import type { StatHolomodelsCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_holomodels_count.php → /statistics/order/order_holomodels_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsHolomodelsCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsHolomodelsCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_holomodels_count")({
  validateSearch: (search: Record<string, unknown>): StatHolomodelsCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsHolomodelsCountRoute,
});
