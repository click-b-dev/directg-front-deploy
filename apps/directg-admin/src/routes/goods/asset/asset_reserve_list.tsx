import { createFileRoute } from "@tanstack/react-router";
import { AssetReserveListScreen, type AssetReserveSearchProps } from "@screens/asset-reserve-list";

// legacy pc/_Admin_/goods/asset/asset_reserve_list.php → /goods/asset/asset_reserve_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetReserveListRoute = () => {
  const search = Route.useSearch();
  return <AssetReserveListScreen {...search} />;
};

export const Route = createFileRoute("/goods/asset/asset_reserve_list")({
  validateSearch: (search: Record<string, unknown>): AssetReserveSearchProps => ({
    page: Number(search.page) || 1,
    ordno: str(search.ordno),
    owner: str(search.owner),
    cancelled: str(search.cancelled),
  }),
  component: AssetReserveListRoute,
});
