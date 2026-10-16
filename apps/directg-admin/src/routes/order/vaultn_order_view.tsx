import { createFileRoute } from "@tanstack/react-router";
import { OrderVaultnViewScreen } from "@screens/order-vaultn-view";
import type { OrderVaultnViewSearch } from "@entities/order";

// legacy pc/_Admin_/order/vaultn_order_view.php → /order/vaultn_order_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderVaultnViewRoute = () => {
  const search = Route.useSearch();
  return <OrderVaultnViewScreen {...search} />;
};

export const Route = createFileRoute("/order/vaultn_order_view")({
  validateSearch: (search: Record<string, unknown>): OrderVaultnViewSearch => ({
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: OrderVaultnViewRoute,
});
