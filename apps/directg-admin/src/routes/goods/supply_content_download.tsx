import { createFileRoute } from "@tanstack/react-router";
import { GoodsSupplyContentDownloadScreen } from "@screens/goods-supply-content-download";
import type { PatchDownloadSearch } from "@entities/supply-content";

// legacy pc/_Admin_/goods/supply_content_download.php → /goods/supply_content_download
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SupplyContentDownloadRoute = () => {
  const search = Route.useSearch();
  return <GoodsSupplyContentDownloadScreen {...search} />;
};

export const Route = createFileRoute("/goods/supply_content_download")({
  validateSearch: (search: Record<string, unknown>): PatchDownloadSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: SupplyContentDownloadRoute,
});
