import { createFileRoute } from "@tanstack/react-router";
import {
  GoodsPromotionStockScreen,
  type GoodsPromotionStockSearchProps,
} from "@screens/goods-promotion-stock";

// legacy pc/_Admin_/goods/stock/goods_promotion_stock.php → /goods/stock/goods_promotion_stock
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GoodsPromotionStockRoute = () => {
  const search = Route.useSearch();
  return <GoodsPromotionStockScreen {...search} />;
};

export const Route = createFileRoute("/goods/stock/goods_promotion_stock")({
  validateSearch: (search: Record<string, unknown>): GoodsPromotionStockSearchProps => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    publisherCd: str(search.publisherCd),
    productTypeCd: str(search.productTypeCd),
    assetTypeCd: str(search.assetTypeCd),
    platformCd: str(search.platformCd),
  }),
  component: GoodsPromotionStockRoute,
});
