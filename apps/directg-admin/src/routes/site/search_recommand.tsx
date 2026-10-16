import { createFileRoute } from "@tanstack/react-router";
import { SearchRecommandScreen } from "@screens/search-recommand";

// legacy pc/_Admin_/site/search_recommand.php (?page&search_keyword) → /site/search_recommand
type SearchRecommandSearch = {
  page: number;
  search_keyword: string;
};

const SearchRecommandRoute = () => {
  const { page, search_keyword } = Route.useSearch();
  return <SearchRecommandScreen page={page} searchKeyword={search_keyword} />;
};

export const Route = createFileRoute("/site/search_recommand")({
  validateSearch: (search: Record<string, unknown>): SearchRecommandSearch => ({
    page: Number(search.page) || 1,
    search_keyword: typeof search.search_keyword === "string" ? search.search_keyword : "",
  }),
  component: SearchRecommandRoute,
});
