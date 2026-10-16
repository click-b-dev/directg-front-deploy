import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionPricelistScreen } from "@screens/vaultn-connection-pricelist";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection_pricelist.php → /goods/vaultn/vaultn_connection_pricelist
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnConnectionPricelistRoute = () => {
  const { connectionGuid } = Route.useSearch();
  return <VaultnConnectionPricelistScreen connectionGuid={connectionGuid} />;
};

export const Route = createFileRoute("/goods/vaultn/vaultn_connection_pricelist")({
  validateSearch: (search: Record<string, unknown>): { connectionGuid: string } => ({
    connectionGuid: str(search.connectionGuid),
  }),
  component: VaultnConnectionPricelistRoute,
});
