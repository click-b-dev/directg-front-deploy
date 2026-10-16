import { createFileRoute } from "@tanstack/react-router";
import { DataroomDownloadScreen } from "@screens/dataroom-download";
import type { DataroomDownloadSearch } from "@entities/dataroom";

// legacy pc/_Admin_/board/dataroom_download.php → /board/dataroom_download
const str = (value: unknown) => (typeof value === "string" ? value : "");

const DataroomDownloadRoute = () => {
  const search = Route.useSearch();
  return <DataroomDownloadScreen {...search} />;
};

export const Route = createFileRoute("/board/dataroom_download")({
  validateSearch: (search: Record<string, unknown>): DataroomDownloadSearch => ({
    page: Number(search.page) || 1,
    search_title_name: str(search.search_title_name),
  }),
  component: DataroomDownloadRoute,
});
