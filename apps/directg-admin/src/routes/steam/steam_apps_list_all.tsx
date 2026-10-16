import { createFileRoute } from "@tanstack/react-router";
import { SteamAppsListAllScreen } from "@screens/steam-apps-list-all";
import type { SteamAppAllSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_apps_list_all.php → /steam/steam_apps_list_all
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamAppsListAllRoute = () => {
  const search = Route.useSearch();
  return <SteamAppsListAllScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_apps_list_all")({
  validateSearch: (search: Record<string, unknown>): SteamAppAllSearch => ({
    page: Number(search.page) || 1,
    search_year: str(search.search_year),
    search_publisher: str(search.search_publisher),
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
    search_app_type: str(search.search_app_type),
    is_free: str(search.is_free),
    supported_languages: str(search.supported_languages),
    search_developer: str(search.search_developer),
  }),
  component: SteamAppsListAllRoute,
});
