import { createFileRoute } from "@tanstack/react-router";
import { PointNexusActivityLogViewScreen } from "@screens/pointnexus-activity-log-view";
import type { PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_activity_log_view.php → /goods/pointnexus/pointnexus_activity_log_view
const str = (value: unknown) => (typeof value === "string" ? value : "");
// legacy: mode != 'prod' → 'test' (이 화면만 기본 test)
const normMode = (v: unknown): PnMode => (v === "prod" ? "prod" : "test");

const PointNexusActivityLogViewRoute = () => {
  const { mode, id } = Route.useSearch();
  return <PointNexusActivityLogViewScreen mode={mode} id={id} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_activity_log_view")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; id: string } => ({
    mode: normMode(search.mode),
    id: str(search.id),
  }),
  component: PointNexusActivityLogViewRoute,
});
