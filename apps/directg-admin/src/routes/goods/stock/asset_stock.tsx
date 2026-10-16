import { createFileRoute } from "@tanstack/react-router";
import { AssetStockScreen, type AssetStockSearchProps } from "@screens/asset-stock";

// legacy pc/_Admin_/goods/stock/asset_stock.php (?page&asset_id&asset_name&*Cd) → /goods/stock/asset_stock
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetStockRoute = () => {
  const search = Route.useSearch();
  return <AssetStockScreen {...search} />;
};

export const Route = createFileRoute("/goods/stock/asset_stock")({
  validateSearch: (search: Record<string, unknown>): AssetStockSearchProps => ({
    page: Number(search.page) || 1,
    asset_id: str(search.asset_id),
    asset_name: str(search.asset_name),
    publisherCd: str(search.publisherCd),
    assetTypeCd: str(search.assetTypeCd),
    productTypeCd: str(search.productTypeCd),
    platformCd: str(search.platformCd),
  }),
  component: AssetStockRoute,
});
