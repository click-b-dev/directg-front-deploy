import { createFileRoute } from "@tanstack/react-router";
import { OrderDetailScreen } from "@screens/order-detail";
import type { OrderDetailSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_view.php → /order/order_view
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderViewRoute = () => {
  const search = Route.useSearch();
  return <OrderDetailScreen {...search} />;
};

export const Route = createFileRoute("/order/order_view")({
  validateSearch: (search: Record<string, unknown>): OrderDetailSearch => ({
    settle_no: str(search.settle_no),
  }),
  component: OrderViewRoute,
});
