import { createFileRoute } from "@tanstack/react-router";
import {
  AssetStockRandomScreen,
  type AssetStockRandomSearchProps,
} from "@screens/asset-stock-random";

// legacy pc/_Admin_/goods/stock/asset_stock_random.php → /goods/stock/asset_stock_random
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetStockRandomRoute = () => {
  const search = Route.useSearch();
  return <AssetStockRandomScreen {...search} />;
};

export const Route = createFileRoute("/goods/stock/asset_stock_random")({
  validateSearch: (search: Record<string, unknown>): AssetStockRandomSearchProps => ({
    page: Number(search.page) || 1,
    asset_id: str(search.asset_id),
    asset_name: str(search.asset_name),
    publisherCd: str(search.publisherCd),
    productTypeCd: str(search.productTypeCd),
    platformCd: str(search.platformCd),
  }),
  component: AssetStockRandomRoute,
});
