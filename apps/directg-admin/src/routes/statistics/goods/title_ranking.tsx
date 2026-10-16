import { createFileRoute } from "@tanstack/react-router";
import { StatisticsTitleRankingScreen } from "@screens/statistics-title-ranking";
import type { StatTitleRankingSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/goods/title_ranking.php → /statistics/goods/title_ranking
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsTitleRankingRoute = () => {
  const search = Route.useSearch();
  return <StatisticsTitleRankingScreen {...search} />;
};

export const Route = createFileRoute("/statistics/goods/title_ranking")({
  validateSearch: (search: Record<string, unknown>): StatTitleRankingSearch => ({
    search_year: str(search.search_year),
    search_month: str(search.search_month),
    page: Number(search.page) || 1,
  }),
  component: StatisticsTitleRankingRoute,
});
