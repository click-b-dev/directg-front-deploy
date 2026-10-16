import { createFileRoute } from "@tanstack/react-router";
import { PromotionSeasonViewScreen } from "@screens/promotion-season-view";
import type { PromotionSeasonViewSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_season_view.php → /promotion/promotion_season_view
const PromotionSeasonViewRoute = () => {
  const search = Route.useSearch();
  return <PromotionSeasonViewScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_season_view")({
  validateSearch: (search: Record<string, unknown>): PromotionSeasonViewSearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: PromotionSeasonViewRoute,
});
