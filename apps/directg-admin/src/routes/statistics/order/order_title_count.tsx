import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderTitleCountScreen } from "@screens/statistics-order-title-count";
import type { StatOrderTitleCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_title_count.php → /statistics/order/order_title_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderTitleCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderTitleCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_title_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderTitleCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsOrderTitleCountRoute,
});
