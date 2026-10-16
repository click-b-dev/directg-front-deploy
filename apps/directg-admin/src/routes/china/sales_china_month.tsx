import { createFileRoute } from "@tanstack/react-router";
import { ChinaSalesMonthScreen } from "@screens/china-sales-month";
import type { ChinaSalesMonthSearch } from "@entities/china";

// legacy pc/_Admin_/china/sales_china_month.php → /china/sales_china_month
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaSalesMonthRoute = () => {
  const search = Route.useSearch();
  return <ChinaSalesMonthScreen {...search} />;
};

export const Route = createFileRoute("/china/sales_china_month")({
  validateSearch: (search: Record<string, unknown>): ChinaSalesMonthSearch => ({
    search_year: str(search.search_year),
  }),
  component: ChinaSalesMonthRoute,
});
