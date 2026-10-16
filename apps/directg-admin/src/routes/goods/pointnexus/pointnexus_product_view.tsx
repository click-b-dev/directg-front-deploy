import { createFileRoute } from "@tanstack/react-router";
import { PointNexusProductViewScreen } from "@screens/pointnexus-product-view";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_product_view.php → /goods/pointnexus/pointnexus_product_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusProductViewRoute = () => {
  const { mode, id } = Route.useSearch();
  return <PointNexusProductViewScreen mode={mode} id={id} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_product_view")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; id: string } => ({
    mode: normalizePnMode(search.mode),
    id: str(search.id),
  }),
  component: PointNexusProductViewRoute,
});
