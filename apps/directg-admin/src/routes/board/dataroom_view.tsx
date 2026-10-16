import { createFileRoute } from "@tanstack/react-router";
import { DataroomViewScreen, type DataroomViewSearch } from "@screens/dataroom-view";

// legacy pc/_Admin_/board/dataroom_view.php → /board/dataroom_view
const DataroomViewRoute = () => {
  const search = Route.useSearch();
  return <DataroomViewScreen {...search} />;
};

export const Route = createFileRoute("/board/dataroom_view")({
  validateSearch: (search: Record<string, unknown>): DataroomViewSearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: DataroomViewRoute,
});
