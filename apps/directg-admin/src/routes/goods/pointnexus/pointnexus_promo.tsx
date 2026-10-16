import { createFileRoute } from "@tanstack/react-router";
import { PointNexusPromoScreen } from "@screens/pointnexus-promo";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_promo.php → /goods/pointnexus/pointnexus_promo
const PointNexusPromoRoute = () => {
  const { mode } = Route.useSearch();
  return <PointNexusPromoScreen mode={mode} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_promo")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode } => ({
    mode: normalizePnMode(search.mode),
  }),
  component: PointNexusPromoRoute,
});
