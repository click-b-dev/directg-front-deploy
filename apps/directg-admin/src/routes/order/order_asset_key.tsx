import { createFileRoute } from "@tanstack/react-router";
import { OrderAssetKeyScreen } from "@screens/order-asset-key";

// legacy pc/_Admin_/order/order_asset_key.php → /order/order_asset_key
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderAssetKeyRoute = () => {
  const search = Route.useSearch();
  return <OrderAssetKeyScreen {...search} />;
};

export const Route = createFileRoute("/order/order_asset_key")({
  validateSearch: (search: Record<string, unknown>): { ordno: string } => ({
    ordno: str(search.ordno),
  }),
  component: OrderAssetKeyRoute,
});
