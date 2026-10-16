import { createFileRoute } from "@tanstack/react-router";
import {
  GoodsOptionStockScreen,
  type GoodsOptionStockSearchProps,
} from "@screens/goods-option-stock";

// legacy pc/_Admin_/goods/stock/goods_option_stock.php → /goods/stock/goods_option_stock
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsOptionStockRoute = () => {
  const search = Route.useSearch();
  return <GoodsOptionStockScreen {...search} />;
};

export const Route = createFileRoute("/goods/stock/goods_option_stock")({
  validateSearch: (search: Record<string, unknown>): GoodsOptionStockSearchProps => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    publisherCd: str(search.publisherCd),
    productTypeCd: str(search.productTypeCd),
    assetTypeCd: str(search.assetTypeCd),
    platformCd: str(search.platformCd),
  }),
  component: GoodsOptionStockRoute,
});
