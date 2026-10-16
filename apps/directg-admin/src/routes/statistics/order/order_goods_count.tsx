import { createFileRoute } from "@tanstack/react-router";
import { StatisticsOrderGoodsCountScreen } from "@screens/statistics-order-goods-count";
import type { StatOrderGoodsCountSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/order/order_goods_count.php → /statistics/order/order_goods_count
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsOrderGoodsCountRoute = () => {
  const search = Route.useSearch();
  return <StatisticsOrderGoodsCountScreen {...search} />;
};

export const Route = createFileRoute("/statistics/order/order_goods_count")({
  validateSearch: (search: Record<string, unknown>): StatOrderGoodsCountSearch => ({
    search_year: str(search.search_year),
    search_product_code: str(search.search_product_code),
    search_supplier_code: str(search.search_supplier_code),
  }),
  component: StatisticsOrderGoodsCountRoute,
});
