import { createFileRoute } from "@tanstack/react-router";
import { PointNexusOperationScreen } from "@screens/pointnexus-operation";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_operation.php → /goods/pointnexus/pointnexus_operation
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusOperationRoute = () => {
  const { mode, id } = Route.useSearch();
  return <PointNexusOperationScreen mode={mode} id={id} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_operation")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; id: string } => ({
    mode: normalizePnMode(search.mode),
    id: str(search.id),
  }),
  component: PointNexusOperationRoute,
});
