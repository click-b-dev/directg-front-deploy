import { createFileRoute } from "@tanstack/react-router";
import { VaultnCatalogueScreen } from "@screens/vaultn-catalogue";
import type { VaultnProductSearch } from "@entities/vaultn";

// legacy pc/_Admin_/goods/vaultn/vaultn_catalogue.php → /goods/vaultn/vaultn_catalogue
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnCatalogueRoute = () => {
  const search = Route.useSearch();
  return <VaultnCatalogueScreen {...search} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_catalogue")({
  validateSearch: (search: Record<string, unknown>): VaultnProductSearch => ({
    page: Number(search.page) || 1,
    search_product_id: str(search.search_product_id),
    search_sku: str(search.search_sku),
    search_name: str(search.search_name),
  }),
  component: VaultnCatalogueRoute,
});
