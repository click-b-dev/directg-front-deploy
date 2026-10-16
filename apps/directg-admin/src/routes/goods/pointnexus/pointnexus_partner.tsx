import { createFileRoute } from "@tanstack/react-router";
import { PointNexusPartnerScreen } from "@screens/pointnexus-partner";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_partner.php → /goods/pointnexus/pointnexus_partner
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusPartnerRoute = () => {
  const { mode, persona } = Route.useSearch();
  return <PointNexusPartnerScreen mode={mode} persona={persona} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_partner")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; persona: string } => ({
    mode: normalizePnMode(search.mode),
    persona: str(search.persona),
  }),
  component: PointNexusPartnerRoute,
});
