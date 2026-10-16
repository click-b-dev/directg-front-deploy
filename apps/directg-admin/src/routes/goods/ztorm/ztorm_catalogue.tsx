import { createFileRoute } from "@tanstack/react-router";
import { ZtormCatalogueScreen } from "@screens/ztorm-catalogue";
import type { ZtormCatalogueSearch } from "@entities/ztorm";

// legacy pc/_Admin_/goods/ztorm/ztorm_catalogue.php → /goods/ztorm/ztorm_catalogue
const ZtormCatalogueRoute = () => {
  const search = Route.useSearch();
  return <ZtormCatalogueScreen {...search} />;
};

export const Route = createFileRoute("/goods/ztorm/ztorm_catalogue")({
  validateSearch: (search: Record<string, unknown>): ZtormCatalogueSearch => ({
    page: Number(search.page) || 1,
  }),
  component: ZtormCatalogueRoute,
});
