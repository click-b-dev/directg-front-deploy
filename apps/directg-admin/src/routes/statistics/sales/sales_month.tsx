import { createFileRoute } from "@tanstack/react-router";
import { StatisticsSalesMonthScreen } from "@screens/statistics-sales-month";
import type { StatSalesMonthCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/sales/sales_month.php → /statistics/sales/sales_month
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsSalesMonthRoute = () => {
  const search = Route.useSearch();
  return <StatisticsSalesMonthScreen {...search} />;
};

export const Route = createFileRoute("/statistics/sales/sales_month")({
  validateSearch: (search: Record<string, unknown>): StatSalesMonthCountSearch => ({
    search_year: str(search.search_year),
  }),
  component: StatisticsSalesMonthRoute,
});
