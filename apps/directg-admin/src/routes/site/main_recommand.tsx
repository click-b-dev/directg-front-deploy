import { createFileRoute } from "@tanstack/react-router";
import { RecommandListScreen } from "@screens/recommand-list";

// legacy pc/_Admin_/site/main_recommand.php (?page&search_recommand_name) → /site/main_recommand
// 검색은 개발자 지시로 legacy 파라미터 불일치 버그를 수정 — search_recommand_name으로 필터.
type RecommandListSearch = {
  page: number;
  search_recommand_name: string;
};

const RecommandListRoute = () => {
  const { page, search_recommand_name } = Route.useSearch();
  return <RecommandListScreen page={page} searchRecommandName={search_recommand_name} />;
};

export const Route = createFileRoute("/site/main_recommand")({
  validateSearch: (search: Record<string, unknown>): RecommandListSearch => ({
    page: Number(search.page) || 1,
    search_recommand_name:
      typeof search.search_recommand_name === "string" ? search.search_recommand_name : "",
  }),
  component: RecommandListRoute,
});
