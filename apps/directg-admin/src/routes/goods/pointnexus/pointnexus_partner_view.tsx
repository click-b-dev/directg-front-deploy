import { createFileRoute } from "@tanstack/react-router";
import { PointNexusPartnerViewScreen } from "@screens/pointnexus-partner-view";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_partner_view.php → /goods/pointnexus/pointnexus_partner_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusPartnerViewRoute = () => {
  const { mode, partnerID } = Route.useSearch();
  return <PointNexusPartnerViewScreen mode={mode} partnerID={partnerID} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_partner_view")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; partnerID: string } => ({
    mode: normalizePnMode(search.mode),
    partnerID: str(search.partnerID),
  }),
  component: PointNexusPartnerViewRoute,
});
