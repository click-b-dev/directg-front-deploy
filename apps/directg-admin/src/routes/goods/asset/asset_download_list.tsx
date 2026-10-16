import { createFileRoute } from "@tanstack/react-router";
import {
  AssetDownloadListScreen,
  type AssetDownloadSearchProps,
} from "@screens/asset-download-list";

// legacy pc/_Admin_/goods/asset/asset_download_list.php → /goods/asset/asset_download_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const AssetDownloadListRoute = () => {
  const search = Route.useSearch();
  return <AssetDownloadListScreen {...search} />;
};

export const Route = createFileRoute("/goods/asset/asset_download_list")({
  validateSearch: (search: Record<string, unknown>): AssetDownloadSearchProps => ({
    page: Number(search.page) || 1,
    owner: str(search.owner),
    asset_id: str(search.asset_id),
  }),
  component: AssetDownloadListRoute,
});
