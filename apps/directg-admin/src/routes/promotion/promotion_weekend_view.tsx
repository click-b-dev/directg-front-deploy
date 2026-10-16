import { createFileRoute } from "@tanstack/react-router";
import { PromotionWeekendViewScreen } from "@screens/promotion-weekend-view";
import type { PromotionWeekendViewSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_weekend_view.php → /promotion/promotion_weekend_view
const PromotionWeekendViewRoute = () => {
  const search = Route.useSearch();
  return <PromotionWeekendViewScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_weekend_view")({
  validateSearch: (search: Record<string, unknown>): PromotionWeekendViewSearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: PromotionWeekendViewRoute,
});
