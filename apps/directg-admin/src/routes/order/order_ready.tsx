import { createFileRoute } from "@tanstack/react-router";
import { OrderReadyScreen } from "@screens/order-ready";
import type { OrderReadySearch } from "@entities/order";

// legacy pc/_Admin_/order/order_ready.php → /order/order_ready
const OrderReadyRoute = () => {
  const search = Route.useSearch();
  return <OrderReadyScreen {...search} />;
};

export const Route = createFileRoute("/order/order_ready")({
  validateSearch: (search: Record<string, unknown>): OrderReadySearch => ({
    page: Number(search.page) || 1,
  }),
  component: OrderReadyRoute,
});
