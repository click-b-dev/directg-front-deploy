import { createFileRoute } from "@tanstack/react-router";
import { StatisticsGenbaPublisherCountScreen } from "@screens/statistics-genba-publisher-count";
import type { StatGenbaPublisherCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/genba_publisher_count.php → /statistics/order/genba_publisher_count
const page = (v: unknown) => {
  const n = Number(v ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const StatisticsGenbaPublisherCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsGenbaPublisherCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/genba_publisher_count")({
  validateSearch: (search: Record<string, unknown>): StatGenbaPublisherCountSearch => ({
    page: page(search.page),
  }),
  component: StatisticsGenbaPublisherCountRoute,
});
