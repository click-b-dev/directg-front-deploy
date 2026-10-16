import { createFileRoute } from "@tanstack/react-router";
import { StatisticsGenbaTotalCountScreen } from "@screens/statistics-genba-total-count";
import type { StatGenbaTotalCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/genba_total_count.php → /statistics/order/genba_total_count
const page = (v: unknown) => {
  const n = Number(v ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const StatisticsGenbaTotalCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsGenbaTotalCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/genba_total_count")({
  validateSearch: (search: Record<string, unknown>): StatGenbaTotalCountSearch => ({
    page: page(search.page),
  }),
  component: StatisticsGenbaTotalCountRoute,
});
