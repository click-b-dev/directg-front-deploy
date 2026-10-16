import { createFileRoute } from "@tanstack/react-router";
import { ChinaOrderMonthScreen } from "@screens/china-order-month";
import type { ChinaOrderMonthSearch } from "@entities/china";

// legacy pc/_Admin_/china/order_china_month.php → /china/order_china_month
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const ChinaOrderMonthRoute = () => {
  const search = Route.useSearch();
  return <ChinaOrderMonthScreen {...search} />;
};

export const Route = createFileRoute("/china/order_china_month")({
  validateSearch: (search: Record<string, unknown>): ChinaOrderMonthSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
  }),
  component: ChinaOrderMonthRoute,
});
