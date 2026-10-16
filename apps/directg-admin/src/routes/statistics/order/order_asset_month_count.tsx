import { createFileRoute } from "@tanstack/react-router";
import { StatisticsAssetMonthCountScreen } from "@screens/statistics-asset-month-count";
import type { StatAssetMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_asset_month_count.php → /statistics/order/order_asset_month_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsAssetMonthCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsAssetMonthCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_asset_month_count")({
  validateSearch: (search: Record<string, unknown>): StatAssetMonthCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    page: Number(search.page) || 1,
  }),
  component: StatisticsAssetMonthCountRoute,
});
