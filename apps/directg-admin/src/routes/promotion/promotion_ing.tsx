import { createFileRoute } from "@tanstack/react-router";
import { PromotionIngScreen } from "@screens/promotion-ing";
import type { PromotionIngListSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_ing.php → /promotion/promotion_ing
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionIngRoute = () => {
  const search = Route.useSearch();
  return <PromotionIngScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_ing")({
  validateSearch: (search: Record<string, unknown>): PromotionIngListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_confirm: str(search.search_confirm),
  }),
  component: PromotionIngRoute,
});
