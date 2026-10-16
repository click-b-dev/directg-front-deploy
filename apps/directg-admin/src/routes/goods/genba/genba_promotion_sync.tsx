import { createFileRoute } from "@tanstack/react-router";
import { GenbaPromotionSyncScreen } from "@screens/genba-promotion-sync";
import type { GenbaPromotionSearch } from "@entities/genba";

// legacy pc/_Admin_/goods/genba/genba_promotion_sync.php → /goods/genba/genba_promotion_sync
const GenbaPromotionSyncRoute = () => {
  const search = Route.useSearch();
  return <GenbaPromotionSyncScreen {...search} />;
};

export const Route = createFileRoute("/goods/genba/genba_promotion_sync")({
  validateSearch: (search: Record<string, unknown>): GenbaPromotionSearch => ({
    page: Number(search.page) || 1,
    // legacy: 미지정 시 기본 "Scheduled"(진행예정)
    promotion_status:
      typeof search.promotion_status === "string" && search.promotion_status
        ? search.promotion_status
        : "Scheduled",
  }),
  component: GenbaPromotionSyncRoute,
});
