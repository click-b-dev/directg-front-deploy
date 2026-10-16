import { createFileRoute } from "@tanstack/react-router";
import { OrderCancelRequestScreen } from "@screens/order-cancel-request";
import type { OrderCancelRequestSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_cancel_request.php → /order/order_cancel_request
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderCancelRequestRoute = () => {
  const search = Route.useSearch();
  return <OrderCancelRequestScreen {...search} />;
};

export const Route = createFileRoute("/order/order_cancel_request")({
  validateSearch: (search: Record<string, unknown>): OrderCancelRequestSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderCancelRequestRoute,
});
