import { createFileRoute } from "@tanstack/react-router";
import { OrderCancelCompleteScreen } from "@screens/order-cancel-complete";
import type { OrderCancelCompleteSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_cancel_complete.php → /order/order_cancel_complete
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderCancelCompleteRoute = () => {
  const search = Route.useSearch();
  return <OrderCancelCompleteScreen {...search} />;
};

export const Route = createFileRoute("/order/order_cancel_complete")({
  validateSearch: (search: Record<string, unknown>): OrderCancelCompleteSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    search_pg_provider: str(search.search_pg_provider),
    search_payment_method: str(search.search_payment_method),
    search_orderby: str(search.search_orderby),
    search_date_type: str(search.search_date_type),
    date_label: str(search.date_label),
  }),
  component: OrderCancelCompleteRoute,
});
