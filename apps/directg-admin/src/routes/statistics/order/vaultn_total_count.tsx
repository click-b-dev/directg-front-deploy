import { createFileRoute } from "@tanstack/react-router";
import { StatisticsVaultnTotalCountScreen } from "@screens/statistics-vaultn-total-count";
import type { StatVaultnTotalCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/vaultn_total_count.php → /statistics/order/vaultn_total_count
const num = (v: unknown) => {
  const n = Number(v ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

const StatisticsVaultnTotalCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsVaultnTotalCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/vaultn_total_count")({
  validateSearch: (search: Record<string, unknown>): StatVaultnTotalCountSearch => ({
    page: num(search.page),
  }),
  component: StatisticsVaultnTotalCountRoute,
});
