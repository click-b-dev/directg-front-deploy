import { createFileRoute } from "@tanstack/react-router";
import { AssetListScreen, type AssetSearchProps } from "@screens/asset-list";

// legacy pc/_Admin_/goods/asset/asset_list.php → /goods/asset/asset_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetListRoute = () => {
  const search = Route.useSearch();
  return <AssetListScreen {...search} />;
};

export const Route = createFileRoute("/goods/asset/asset_list")({
  validateSearch: (search: Record<string, unknown>): AssetSearchProps => ({
    page: Number(search.page) || 1,
    searchValue: str(search.searchValue),
    searchID: str(search.searchID),
    publisherCd: str(search.publisherCd),
    productTypeCd: str(search.productTypeCd),
    assetTypeCd: str(search.assetTypeCd),
    platformCd: str(search.platformCd),
  }),
  component: AssetListRoute,
});
