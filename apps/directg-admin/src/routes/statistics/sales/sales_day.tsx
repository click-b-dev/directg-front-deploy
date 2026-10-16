import { createFileRoute } from "@tanstack/react-router";
import { StatisticsSalesDayScreen } from "@screens/statistics-sales-day";
import type { StatSalesDayCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/sales/sales_day.php → /statistics/sales/sales_day
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsSalesDayRoute = () => {
  const search = Route.useSearch();
  return <StatisticsSalesDayScreen {...search} />;
};

export const Route = createFileRoute("/statistics/sales/sales_day")({
  validateSearch: (search: Record<string, unknown>): StatSalesDayCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsSalesDayRoute,
});
