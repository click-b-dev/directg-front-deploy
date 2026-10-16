import { createFileRoute } from "@tanstack/react-router";
import { SteamPackageListScreen } from "@screens/steam-package-list";
import type { SteamPackageSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_package_list.php → /steam/steam_package_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamPackageListRoute = () => {
  const search = Route.useSearch();
  return <SteamPackageListScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_package_list")({
  validateSearch: (search: Record<string, unknown>): SteamPackageSearch => ({
    page: Number(search.page) || 1,
    search_packageid: str(search.search_packageid),
    search_name: str(search.search_name),
  }),
  component: SteamPackageListRoute,
});
