import { createFileRoute } from "@tanstack/react-router";
import { NoticeListScreen } from "@screens/notice-list";
import type { NoticeListSearch } from "@entities/notice";

// legacy pc/_Admin_/board/notice_list.php → /board/notice_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const NoticeListRoute = () => {
  const search = Route.useSearch();
  return <NoticeListScreen {...search} />;
};

export const Route = createFileRoute("/board/notice_list")({
  validateSearch: (search: Record<string, unknown>): NoticeListSearch => ({
    page: Number(search.page) || 1,
    search_title: str(search.search_title),
    search_notice_type: str(search.search_notice_type),
  }),
  component: NoticeListRoute,
});
