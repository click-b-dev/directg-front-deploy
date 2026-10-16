import { createFileRoute } from "@tanstack/react-router";
import { PromotionSeasonScreen } from "@screens/promotion-season";
import type { PromotionSeasonListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_season.php → /promotion/promotion_season
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionSeasonRoute = () => {
  const search = Route.useSearch();
  return <PromotionSeasonScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_season")({
  validateSearch: (search: Record<string, unknown>): PromotionSeasonListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: PromotionSeasonRoute,
});
