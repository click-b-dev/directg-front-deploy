import { createFileRoute } from "@tanstack/react-router";
import { PointNexusActivityLogScreen } from "@screens/pointnexus-activity-log";
import { normalizePnMode, type PnMode } from "@entities/pointnexus";

// legacy pc/_Admin_/goods/pointnexus/pointnexus_activity_log.php → /goods/pointnexus/pointnexus_activity_log
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SORT_LIST = ["createdAt", "productID", "type"];

const normOffset = (v: unknown) => {
  const n = Number(v);
  return !n || n < 0 ? 0 : n;
};
const normLimit = (v: unknown) => {
  const n = Number(v);
  if (!n || n < 10) {
    return 50;
  }
  if (n > 100) {
    return 100;
  }
  return n;
};

type ActivityLogSearch = {
  mode: PnMode;
  offset: number;
  limit: number;
  sort: string;
  sortDirection: string;
  filters: string;
};

const PointNexusActivityLogRoute = () => {
  const search = Route.useSearch();
  return <PointNexusActivityLogScreen {...search} />;
};

export const Route = createFileRoute("/goods/pointnexus/pointnexus_activity_log")({
  validateSearch: (search: Record<string, unknown>): ActivityLogSearch => {
    const sort = str(search.sort);
    return {
      mode: normalizePnMode(search.mode),
      offset: normOffset(search.offset),
      limit: normLimit(search.limit),
      sort: SORT_LIST.includes(sort) ? sort : "createdAt",
      sortDirection: search.sortDirection === "ASC" ? "ASC" : "DESC",
      filters: str(search.filters),
    };
  },
  component: PointNexusActivityLogRoute,
});
