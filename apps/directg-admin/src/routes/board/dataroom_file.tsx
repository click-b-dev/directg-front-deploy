import { createFileRoute } from "@tanstack/react-router";
import { DataroomFileScreen } from "@screens/dataroom-file";
import type { DataroomListSearch } from "@entities/dataroom";

// legacy pc/_Admin_/board/dataroom_file.php → /board/dataroom_file
const DataroomFileRoute = () => {
  const search = Route.useSearch();
  return <DataroomFileScreen {...search} />;
};

export const Route = createFileRoute("/board/dataroom_file")({
  validateSearch: (search: Record<string, unknown>): DataroomListSearch => ({
    page: Number(search.page) || 1,
  }),
  component: DataroomFileRoute,
});
