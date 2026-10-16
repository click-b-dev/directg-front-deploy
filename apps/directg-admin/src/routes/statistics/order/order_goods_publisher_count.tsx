import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderGoodsPublisherCountScreen } from "@screens/statistics-order-goods-publisher-count";
import type { StatOrderGoodsPublisherCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_goods_publisher_count.php → /statistics/order/order_goods_publisher_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderGoodsPublisherCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderGoodsPublisherCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_goods_publisher_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderGoodsPublisherCountSearch => ({
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    search_supplier_code: str(search.search_supplier_code),
    search_game_type: str(search.search_game_type),
  }),
  component: StatisticsOrderGoodsPublisherCountRoute,
});
