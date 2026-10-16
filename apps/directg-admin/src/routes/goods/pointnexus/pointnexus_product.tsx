import { createFileRoute } from "@tanstack/react-router";
import { PointNexusProductScreen } from "@screens/pointnexus-product";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_product.php → /goods/pointnexus/pointnexus_product
const str = (value: unknown) => (typeof value === "string" ? value : "");

// legacy: limit(미지정/<10 → 50, >100 → 100), page(미지정/<1 → 1)
const normLimit = (v: unknown) => {
  const n = Number(v);
  if (!n || n < 10) {
    return 50;
  }
  if (n > 100) {
    return 100;
  }
  return n;
};
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

type ProductSearch = { mode: PnMode; page: number; limit: number; filters: string };

const PointNexusProductRoute = () => {
  const search = Route.useSearch();
  return <PointNexusProductScreen {...search} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_product")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => ({
    mode: normalizePnMode(search.mode),
    page: normPage(search.page),
    limit: normLimit(search.limit),
    filters: str(search.filters),
  }),
  component: PointNexusProductRoute,
});
