import { createFileRoute } from "@tanstack/react-router";
import { StatisticsAssetDayCountScreen } from "@screens/statistics-asset-day-count";
import type { StatAssetDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_asset_day_count.php → /statistics/order/order_asset_day_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsAssetDayCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsAssetDayCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_asset_day_count")({
  validateSearch: (search: Record<string, unknown>): StatAssetDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    search_day: str(search.search_day),
    page: Number(search.page) || 1,
  }),
  component: StatisticsAssetDayCountRoute,
});
