import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderPublisherCountScreen } from "@screens/statistics-order-publisher-count";
import type { StatOrderPublisherCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_publisher_count.php → /statistics/order/order_publisher_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderPublisherCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderPublisherCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_publisher_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderPublisherCountSearch => ({
    search_year: str(search.search_year),
  }),
  component: StatisticsOrderPublisherCountRoute,
});
