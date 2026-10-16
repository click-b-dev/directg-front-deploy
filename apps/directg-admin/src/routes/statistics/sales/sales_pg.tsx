import { createFileRoute } from "@tanstack/react-router";
import { StatisticsSalesPgScreen } from "@screens/statistics-sales-pg";
import type { StatSalesPgCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/sales/sales_pg.php → /statistics/sales/sales_pg
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsSalesPgRoute = () => {
  const search = Route.useSearch();
  return <StatisticsSalesPgScreen {...search} />;
};

export const Route = createFileRoute("/statistics/sales/sales_pg")({
  validateSearch: (search: Record<string, unknown>): StatSalesPgCountSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: StatisticsSalesPgRoute,
});
