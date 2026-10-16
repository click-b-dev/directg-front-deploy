import { createFileRoute } from "@tanstack/react-router";
import { SteamAppsListScreen } from "@screens/steam-apps-list";
import type { SteamAppSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_apps_list.php → /steam/steam_apps_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamAppsListRoute = () => {
  const search = Route.useSearch();
  return <SteamAppsListScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_apps_list")({
  validateSearch: (search: Record<string, unknown>): SteamAppSearch => ({
    page: Number(search.page) || 1,
    search_app_type: str(search.search_app_type),
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
    drm_notice: str(search.drm_notice),
    ext_user_account_notice: str(search.ext_user_account_notice),
  }),
  component: SteamAppsListRoute,
});
