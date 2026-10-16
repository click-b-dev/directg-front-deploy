import { createFileRoute } from "@tanstack/react-router";
import { NoticeViewScreen, type NoticeViewSearch } from "@screens/notice-view";

// legacy pc/_Admin_/board/notice_view.php → /board/notice_view
const NoticeViewRoute = () => {
  const search = Route.useSearch();
  return <NoticeViewScreen {...search} />;
};

export const Route = createFileRoute("/board/notice_view")({
  validateSearch: (search: Record<string, unknown>): NoticeViewSearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: NoticeViewRoute,
});
