import { createFileRoute } from "@tanstack/react-router";
import { SteamAppsComingsoonScreen } from "@screens/steam-apps-comingsoon";
import type { SteamComingSoonSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_apps_comingsoon.php → /steam/steam_apps_comingsoon
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamAppsComingsoonRoute = () => {
  const search = Route.useSearch();
  return <SteamAppsComingsoonScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_apps_comingsoon")({
  validateSearch: (search: Record<string, unknown>): SteamComingSoonSearch => ({
    page: Number(search.page) || 1,
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
    search_title_id: str(search.search_title_id),
  }),
  component: SteamAppsComingsoonRoute,
});
