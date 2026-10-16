import { createFileRoute } from "@tanstack/react-router";
import { PromotionWeekendScreen } from "@screens/promotion-weekend";
import type { PromotionWeekendListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_weekend.php → /promotion/promotion_weekend
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionWeekendRoute = () => {
  const search = Route.useSearch();
  return <PromotionWeekendScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_weekend")({
  validateSearch: (search: Record<string, unknown>): PromotionWeekendListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: PromotionWeekendRoute,
});
