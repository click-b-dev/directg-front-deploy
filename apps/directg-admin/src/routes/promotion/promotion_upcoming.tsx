import { createFileRoute } from "@tanstack/react-router";
import { PromotionUpcomingScreen } from "@screens/promotion-upcoming";
import type { PromotionUpcomingListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_upcoming.php → /promotion/promotion_upcoming
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionUpcomingRoute = () => {
  const search = Route.useSearch();
  return <PromotionUpcomingScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_upcoming")({
  validateSearch: (search: Record<string, unknown>): PromotionUpcomingListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_confirm: str(search.search_confirm),
  }),
  component: PromotionUpcomingRoute,
});
