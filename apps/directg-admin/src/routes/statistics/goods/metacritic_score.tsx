import { createFileRoute } from "@tanstack/react-router";
import { StatisticsMetacriticScoreScreen } from "@screens/statistics-metacritic-score";
import type { StatMetacriticScoreSearch } from "@entities/statistics";

// legacy pc/_Admin_/statistics/goods/metacritic_score.php → /statistics/goods/metacritic_score
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const StatisticsMetacriticScoreRoute = () => {
  const search = Route.useSearch();
  return <StatisticsMetacriticScoreScreen {...search} />;
};

export const Route = createFileRoute("/statistics/goods/metacritic_score")({
  validateSearch: (search: Record<string, unknown>): StatMetacriticScoreSearch => ({
    search_year: str(search.search_year),
    page: Number(search.page) || 1,
  }),
  component: StatisticsMetacriticScoreRoute,
});
