import { createFileRoute } from "@tanstack/react-router";
import { PointNexusCatalogueSyncScreen } from "@screens/pointnexus-catalogue-sync";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_catalogue_sync.php → /goods/pointnexus/pointnexus_catalogue_sync
// legacy: limit(<10 → 100, >100 → 100) → 10/50/100
const normLimit = (v: unknown) => {
  const n = Number(v);
  if (!n || n < 10 || n > 100) {
    return 100;
  }
  return n;
};

const PointNexusCatalogueSyncRoute = () => {
  const { mode, limit } = Route.useSearch();
  return <PointNexusCatalogueSyncScreen mode={mode} limit={limit} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_catalogue_sync")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; limit: number } => ({
    mode: normalizePnMode(search.mode),
    limit: normLimit(search.limit),
  }),
  component: PointNexusCatalogueSyncRoute,
});
