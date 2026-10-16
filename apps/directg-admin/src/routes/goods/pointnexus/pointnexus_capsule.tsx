import { createFileRoute } from "@tanstack/react-router";
import { PointNexusCapsuleScreen } from "@screens/pointnexus-capsule";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_capsule.php → /goods/pointnexus/pointnexus_capsule
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PointNexusCapsuleRoute = () => {
  const { mode, id } = Route.useSearch();
  return <PointNexusCapsuleScreen mode={mode} id={id} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_capsule")({
  validateSearch: (search: Record<string, unknown>): { mode: PnMode; id: string } => ({
    mode: normalizePnMode(search.mode),
    id: str(search.id),
  }),
  component: PointNexusCapsuleRoute,
});
