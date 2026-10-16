import { createFileRoute } from "@tanstack/react-router";
import { PromotionReadyScreen } from "@screens/promotion-ready";
import type { PromotionReadyListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_ready.php → /promotion/promotion_ready
const PromotionReadyRoute = () => {
  const search = Route.useSearch();
  return <PromotionReadyScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_ready")({
  validateSearch: (search: Record<string, unknown>): PromotionReadyListSearch => ({
    page: Number(search.page) || 1,
  }),
  component: PromotionReadyRoute,
});
