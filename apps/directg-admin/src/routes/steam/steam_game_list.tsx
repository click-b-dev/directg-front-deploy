import { createFileRoute } from "@tanstack/react-router";
import { SteamGameListScreen } from "@screens/steam-game-list";
import type { SteamGameSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_game_list.php → /steam/steam_game_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamGameListRoute = () => {
  const search = Route.useSearch();
  return <SteamGameListScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_game_list")({
  validateSearch: (search: Record<string, unknown>): SteamGameSearch => ({
    page: Number(search.page) || 1,
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
  }),
  component: SteamGameListRoute,
});
