import { createFileRoute } from "@tanstack/react-router";
import { StatisticsGenbaDayCountScreen } from "@screens/statistics-genba-day-count";
import type { StatGenbaDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_genba_day_count.php → /statistics/order/order_genba_day_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsGenbaDayCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsGenbaDayCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_genba_day_count")({
  validateSearch: (search: Record<string, unknown>): StatGenbaDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_day: str(search.search_day),
  }),
  component: StatisticsGenbaDayCountRoute,
});
