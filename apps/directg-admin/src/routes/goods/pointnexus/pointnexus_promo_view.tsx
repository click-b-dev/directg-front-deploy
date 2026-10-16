import { createFileRoute } from "@tanstack/react-router";
import { PointNexusPromoViewScreen } from "@screens/pointnexus-promo-view";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_promo_view.php → /goods/pointnexus/pointnexus_promo_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusPromoViewRoute = () => {
  const { mode, id } = Route.useSearch();
  return <PointNexusPromoViewScreen mode={mode} id={id} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_promo_view")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; id: string } => ({
    mode: normalizePnMode(search.mode),
    id: str(search.id),
  }),
  component: PointNexusPromoViewRoute,
});
