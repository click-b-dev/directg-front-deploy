import { createFileRoute } from "@tanstack/react-router";
import { PointNexusProductTypeScreen } from "@screens/pointnexus-product-type";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_product_type.php → /goods/pointnexus/pointnexus_product_type
const PointNexusProductTypeRoute = () => {
  const { mode } = Route.useSearch();
  return <PointNexusProductTypeScreen mode={mode} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_product_type")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode } => ({
    mode: normalizePnMode(search.mode),
  }),
  component: PointNexusProductTypeRoute,
});
