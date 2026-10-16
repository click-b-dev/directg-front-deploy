import { createFileRoute } from "@tanstack/react-router";
import { ZtormPromotionScreen } from "@screens/ztorm-promotion";
import type { ZtormPromotionSearch } from "@entities/ztorm";

// legacy pc/_Admin_/goods/ztorm/ztorm_promotion.php → /goods/ztorm/ztorm_promotion
const ZtormPromotionRoute = () => {
  const search = Route.useSearch();
  return <ZtormPromotionScreen {...search} />;
};

export const Route = createFileRoute("/goods/ztorm/ztorm_promotion")({
  validateSearch: (search: Record<string, unknown>): ZtormPromotionSearch => ({
    page: Number(search.page) || 1,
  }),
  component: ZtormPromotionRoute,
});
