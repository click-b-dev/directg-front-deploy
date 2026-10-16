import { createFileRoute } from "@tanstack/react-router";
import { SteamAppsRankingScreen } from "@screens/steam-apps-ranking";
import type { SteamRankingSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_apps_ranking.php → /steam/steam_apps_ranking
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamAppsRankingRoute = () => {
  const search = Route.useSearch();
  return <SteamAppsRankingScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_apps_ranking")({
  validateSearch: (search: Record<string, unknown>): SteamRankingSearch => ({
    page: Number(search.page) || 1,
    search_year: str(search.search_year),
    search_publisher: str(search.search_publisher),
    is_free: str(search.is_free),
  }),
  component: SteamAppsRankingRoute,
});
