import { createFileRoute } from "@tanstack/react-router";
import { VaultnPromotionScreen } from "@screens/vaultn-promotion";

// legacy pc/_Admin_/goods/vaultn/vaultn_promotion.php → /goods/vaultn/vaultn_promotion
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const VaultnPromotionRoute = () => {
  const { page } = Route.useSearch();
  return <VaultnPromotionScreen page={page} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_promotion")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: VaultnPromotionRoute,
});
