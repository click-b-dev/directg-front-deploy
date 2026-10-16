import { createFileRoute } from "@tanstack/react-router";
import { PointNexusVcntCancelScreen } from "@screens/pointnexus-vcnt-cancel";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_vcnt_cancel.php → /goods/pointnexus/pointnexus_vcnt_cancel
const PointNexusVcntCancelRoute = () => {
  const { mode } = Route.useSearch();
  return <PointNexusVcntCancelScreen mode={mode} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_vcnt_cancel")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode } => ({
    mode: normalizePnMode(search.mode),
  }),
  component: PointNexusVcntCancelRoute,
});
