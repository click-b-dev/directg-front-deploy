import { createFileRoute } from "@tanstack/react-router";
import { PromotionWeekendRegisterScreen } from "@screens/promotion-weekend-register";
import type { PromotionWeekendRegisterSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_weekend_register.php → /promotion/promotion_weekend_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionWeekendRegisterRoute = () => {
  const search = Route.useSearch();
  return <PromotionWeekendRegisterScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_weekend_register")({
  validateSearch: (search: Record<string, unknown>): PromotionWeekendRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
  }),
  component: PromotionWeekendRegisterRoute,
});
