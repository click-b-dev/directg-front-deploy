import { createFileRoute } from "@tanstack/react-router";
import { PointNexusPingScreen } from "@screens/pointnexus-ping";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_ping.php → /goods/pointnexus/pointnexus_ping
const PointNexusPingRoute = () => {
  const { mode } = Route.useSearch();
  return <PointNexusPingScreen mode={mode} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_ping")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode } => ({
    mode: normalizePnMode(search.mode),
  }),
  component: PointNexusPingRoute,
});
