import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionPriceScreen } from "@screens/vaultn-connection-price";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection_price.php → /goods/vaultn/vaultn_connection_price
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnConnectionPriceRoute = () => {
  const { connectionGuid, priceListGuid } = Route.useSearch();
  return (
    <VaultnConnectionPriceScreen connectionGuid={connectionGuid} priceListGuid={priceListGuid} />
  );
};

export const Route = createFileRoute("/goods/vaultn/vaultn_connection_price")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { connectionGuid: string; priceListGuid: string } => ({
    connectionGuid: str(search.connectionGuid),
    priceListGuid: str(search.priceListGuid),
  }),
  component: VaultnConnectionPriceRoute,
});
