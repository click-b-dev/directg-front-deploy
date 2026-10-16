import { createFileRoute } from "@tanstack/react-router";
import { QnaViewScreen, type QnaViewSearch } from "@screens/qna-view";

// legacy pc/_Admin_/board/qna_view.php → /board/qna_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const QnaViewRoute = () => {
  const search = Route.useSearch();
  return <QnaViewScreen {...search} />;
};

export const Route = createFileRoute("/board/qna_view")({
  validateSearch: (search: Record<string, unknown>): QnaViewSearch => ({
    idx: Number(search.idx) || 0,
    searchType: str(search.searchType),
    searchTitle: str(search.searchTitle),
    searchGubun: str(search.searchGubun),
    is_answer: str(search.is_answer),
    replyStatus: str(search.replyStatus),
    email_flag: str(search.email_flag),
  }),
  component: QnaViewRoute,
});
