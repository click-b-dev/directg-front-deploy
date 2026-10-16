import { createFileRoute } from "@tanstack/react-router";
import { PointNexusCancelVerifyScreen } from "@screens/pointnexus-cancel-verify";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_cancel_verify.php → /goods/pointnexus/pointnexus_cancel_verify
const PointNexusCancelVerifyRoute = () => {
  const { mode } = Route.useSearch();
  return <PointNexusCancelVerifyScreen mode={mode} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_cancel_verify")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode } => ({
    mode: normalizePnMode(search.mode),
  }),
  component: PointNexusCancelVerifyRoute,
});
