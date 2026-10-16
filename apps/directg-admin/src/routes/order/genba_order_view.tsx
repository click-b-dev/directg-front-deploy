import { createFileRoute } from "@tanstack/react-router";
import { OrderGenbaViewScreen } from "@screens/order-genba-view";
import type { OrderGenbaViewSearch } from "@entities/order";

// legacy pc/_Admin_/order/genba_order_view.php → /order/genba_order_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderGenbaViewRoute = () => {
  const search = Route.useSearch();
  return <OrderGenbaViewScreen {...search} />;
};

export const Route = createFileRoute("/order/genba_order_view")({
  validateSearch: (search: Record<string, unknown>): OrderGenbaViewSearch => ({
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: OrderGenbaViewRoute,
});
