import { createFileRoute } from "@tanstack/react-router";
import { PromotionEndScreen } from "@screens/promotion-end";
import type { PromotionEndListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_end.php → /promotion/promotion_end
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionEndRoute = () => {
  const search = Route.useSearch();
  return <PromotionEndScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_end")({
  validateSearch: (search: Record<string, unknown>): PromotionEndListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_confirm: str(search.search_confirm),
  }),
  component: PromotionEndRoute,
});
