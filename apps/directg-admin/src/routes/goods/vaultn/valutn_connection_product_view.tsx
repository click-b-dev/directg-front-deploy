import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionProductViewScreen } from "@screens/vaultn-connection-product-view";

// legacy pc/_Admin_/goods/vaultn/valutn_connection_product_view.php → /goods/vaultn/valutn_connection_product_view
const str = (value: unknown) => (typeof value === "string" ? value : "");

const VaultnConnectionProductViewRoute = () => {
  const { connectionGuid, productGUID } = Route.useSearch();
  return (
    <VaultnConnectionProductViewScreen connectionGuid={connectionGuid} productGUID={productGUID} />
  );
};

export const Route = createFileRoute("/goods/vaultn/valutn_connection_product_view")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { connectionGuid: string; productGUID: string } => ({
    connectionGuid: str(search.connectionGuid),
    productGUID: str(search.productGUID),
  }),
  component: VaultnConnectionProductViewRoute,
});
