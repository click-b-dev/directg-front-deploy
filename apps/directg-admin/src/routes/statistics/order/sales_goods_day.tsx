import { createFileRoute } from "@tanstack/react-router";
import { StatisticsSalesGoodsDayScreen } from "@screens/statistics-sales-goods-day";
import type { StatSalesGoodsDaySearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/sales_goods_day.php → /statistics/order/sales_goods_day
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsSalesGoodsDayRoute = () => {
  const search = Route.useSearch();
  return <StatisticsSalesGoodsDayScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/sales_goods_day")({
  validateSearch: (search: Record<string, unknown>): StatSalesGoodsDaySearch => ({
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
  }),
  component: StatisticsSalesGoodsDayRoute,
});
