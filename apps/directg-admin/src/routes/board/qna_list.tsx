import { createFileRoute } from "@tanstack/react-router";
import { QnaListScreen } from "@screens/qna-list";
import type { QnaListSearch } from "@entities/qna";

// legacy pc/_Admin_/board/qna_list.php → /board/qna_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const QnaListRoute = () => {
  const search = Route.useSearch();
  return <QnaListScreen {...search} />;
};

export const Route = createFileRoute("/board/qna_list")({
  validateSearch: (search: Record<string, unknown>): QnaListSearch => ({
    page: Number(search.page) || 1,
    searchType: str(search.searchType),
    searchTitle: str(search.searchTitle),
    searchGubun: str(search.searchGubun),
    is_answer: str(search.is_answer),
    replyStatus: str(search.replyStatus),
    email_flag: str(search.email_flag),
  }),
  component: QnaListRoute,
});
