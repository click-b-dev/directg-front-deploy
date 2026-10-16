import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionPromotionScreen } from "@screens/vaultn-connection-promotion";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection_promotion.php → /goods/vaultn/vaultn_connection_promotion
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnConnectionPromotionRoute = () => {
  const { connectionGuid } = Route.useSearch();
  return <VaultnConnectionPromotionScreen connectionGuid={connectionGuid} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_connection_promotion")({
  validateSearch: (search: Record<string, unknown>): { connectionGuid: string } => ({
    connectionGuid: str(search.connectionGuid),
  }),
  component: VaultnConnectionPromotionRoute,
});
