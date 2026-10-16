import { createFileRoute } from "@tanstack/react-router";
import { QnaRegisterScreen, type QnaRegisterSearch } from "@screens/qna-register";

// legacy pc/_Admin_/board/qna_register.php → /board/qna_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const QnaRegisterRoute = () => {
  const search = Route.useSearch();
  return <QnaRegisterScreen {...search} />;
};

export const Route = createFileRoute("/board/qna_register")({
  validateSearch: (search: Record<string, unknown>): QnaRegisterSearch => ({
    idx: Number(search.idx) || 0,
    searchType: str(search.searchType),
    searchTitle: str(search.searchTitle),
    searchGubun: str(search.searchGubun),
    is_answer: str(search.is_answer),
    replyStatus: str(search.replyStatus),
    email_flag: str(search.email_flag),
  }),
  component: QnaRegisterRoute,
});
