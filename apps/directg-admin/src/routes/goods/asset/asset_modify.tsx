import { createFileRoute } from "@tanstack/react-router";
import { AssetModifyScreen, type AssetModifySearchProps } from "@screens/asset-modify";

// legacy pc/_Admin_/goods/asset/asset_modify.php → /goods/asset/asset_modify
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetModifyRoute = () => {
  const search = Route.useSearch();
  return <AssetModifyScreen {...search} />;
};

export const Route = createFileRoute("/goods/asset/asset_modify")({
  validateSearch: (search: Record<string, unknown>): AssetModifySearchProps => ({
    asset_id: str(search.asset_id),
  }),
  component: AssetModifyRoute,
});
