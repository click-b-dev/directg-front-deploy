import { createFileRoute } from "@tanstack/react-router";
import { OrderZtormViewScreen } from "@screens/order-ztorm-view";
import type { OrderZtormViewSearch } from "@entities/order";

// legacy pc/_Admin_/order/ztorm_order_view.php → /order/ztorm_order_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderZtormViewRoute = () => {
  const search = Route.useSearch();
  return <OrderZtormViewScreen {...search} />;
};

export const Route = createFileRoute("/order/ztorm_order_view")({
  validateSearch: (search: Record<string, unknown>): OrderZtormViewSearch => ({
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: OrderZtormViewRoute,
});
