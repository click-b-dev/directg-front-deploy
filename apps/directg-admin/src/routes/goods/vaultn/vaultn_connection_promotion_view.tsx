import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionPromotionViewScreen } from "@screens/vaultn-connection-promotion-view";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection_promotion_view.php → /goods/vaultn/vaultn_connection_promotion_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnConnectionPromotionViewRoute = () => {
  const { connectionGuid, promotionGuid } = Route.useSearch();
  return (
    <VaultnConnectionPromotionViewScreen
      connectionGuid={connectionGuid}
      promotionGuid={promotionGuid}
    />
  );
};

export const Route = createFileRoute("/goods/vaultn/vaultn_connection_promotion_view")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { connectionGuid: string; promotionGuid: string } => ({
    connectionGuid: str(search.connectionGuid),
    promotionGuid: str(search.promotionGuid),
  }),
  component: VaultnConnectionPromotionViewRoute,
});
