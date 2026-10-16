import { createFileRoute } from "@tanstack/react-router";
import { GenbaProductSyncScreen } from "@screens/genba-product-sync";
import type { GenbaProductSearch } from "@entities/genba";

// legacy pc/_Admin_/goods/genba/genba_product_sync.php → /goods/genba/genba_product_sync
const str = (value: unknown) => (typeof value === "string" ? value : "");

const GenbaProductSyncRoute = () => {
  const search = Route.useSearch();
  return <GenbaProductSyncScreen {...search} />;
};

export const Route = createFileRoute("/goods/genba/genba_product_sync")({
  validateSearch: (search: Record<string, unknown>): GenbaProductSearch => ({
    page: Number(search.page) || 1,
    search_product_id: str(search.search_product_id),
    search_sku: str(search.search_sku),
    search_name: str(search.search_name),
    search_publisher: str(search.search_publisher),
    PreLiveState: str(search.PreLiveState),
  }),
  component: GenbaProductSyncRoute,
});
