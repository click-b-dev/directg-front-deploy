import { createFileRoute } from "@tanstack/react-router";
import { PromotionSeasonRegisterScreen } from "@screens/promotion-season-register";
import type { PromotionSeasonRegisterSearch } from "@entities/promotion";

// legacy pc/_Admin_/promotion/promotion_season_register.php → /promotion/promotion_season_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PromotionSeasonRegisterRoute = () => {
  const search = Route.useSearch();
  return <PromotionSeasonRegisterScreen {...search} />;
};

export const Route = createFileRoute("/promotion/promotion_season_register")({
  validateSearch: (search: Record<string, unknown>): PromotionSeasonRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
  }),
  component: PromotionSeasonRegisterRoute,
});
