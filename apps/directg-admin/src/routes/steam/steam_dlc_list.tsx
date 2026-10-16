import { createFileRoute } from "@tanstack/react-router";
import { SteamDlcListScreen } from "@screens/steam-dlc-list";
import type { SteamDlcSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_dlc_list.php → /steam/steam_dlc_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamDlcListRoute = () => {
  const search = Route.useSearch();
  return <SteamDlcListScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_dlc_list")({
  validateSearch: (search: Record<string, unknown>): SteamDlcSearch => ({
    page: Number(search.page) || 1,
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
    is_free: str(search.is_free),
  }),
  component: SteamDlcListRoute,
});
