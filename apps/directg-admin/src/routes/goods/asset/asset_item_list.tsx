import { createFileRoute } from "@tanstack/react-router";
import { AssetItemListScreen, type AssetItemSearchProps } from "@screens/asset-item-list";

// legacy pc/_Admin_/goods/asset/asset_item_list.php → /goods/asset/asset_item_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetItemListRoute = () => {
  const search = Route.useSearch();
  return <AssetItemListScreen {...search} />;
};

export const Route = createFileRoute("/goods/asset/asset_item_list")({
  validateSearch: (search: Record<string, unknown>): AssetItemSearchProps => ({
    page: Number(search.page) || 1,
    asset_id: str(search.asset_id),
  }),
  component: AssetItemListRoute,
});
