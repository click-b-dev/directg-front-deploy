import { createFileRoute } from "@tanstack/react-router";
import { SteamReviewListScreen } from "@screens/steam-review-list";
import type { SteamReviewSearch } from "@entities/steam";

// legacy pc/_Admin_/steam/steam_review_list.php → /steam/steam_review_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const SteamReviewListRoute = () => {
  const search = Route.useSearch();
  return <SteamReviewListScreen {...search} />;
};

export const Route = createFileRoute("/steam/steam_review_list")({
  validateSearch: (search: Record<string, unknown>): SteamReviewSearch => ({
    page: Number(search.page) || 1,
    search_appid: str(search.search_appid),
    search_name: str(search.search_name),
    search_year: str(search.search_year),
  }),
  component: SteamReviewListRoute,
});
