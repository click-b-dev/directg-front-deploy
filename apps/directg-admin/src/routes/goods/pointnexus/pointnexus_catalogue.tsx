import { createFileRoute } from "@tanstack/react-router";
import { PointNexusCatalogueScreen } from "@screens/pointnexus-catalogue";
import { normalizePnMode, type PnCatalogueSearch } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_catalogue.php → /goods/pointnexus/pointnexus_catalogue
const str = (value: unknown) => (typeof value === "string" ? value : "");

const normLimit = (v: unknown) => {
  const n = Number(v);
  if (!n || n < 10) {
    return 50;
  }
  if (n > 200) {
    return 200;
  }
  return n;
};
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const PointNexusCatalogueRoute = () => {
  const search = Route.useSearch();
  return <PointNexusCatalogueScreen {...search} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_catalogue")({
  validateSearch: (search: Record<string, unknown>): PnCatalogueSearch => ({
    mode: normalizePnMode(search.mode),
    keyword: str(search.keyword),
    publisher: str(search.publisher),
    platform: str(search.platform),
    preorder: str(search.preorder),
    mapping: str(search.mapping),
    stale: str(search.stale),
    page: normPage(search.page),
    limit: normLimit(search.limit),
  }),
  component: PointNexusCatalogueRoute,
});
