import { createFileRoute } from "@tanstack/react-router";
import { OrderAllScreen } from "@screens/order-all";
import type { OrderAllSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_all.php → /order/order_all
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderAllRoute = () => {
  const search = Route.useSearch();
  return <OrderAllScreen {...search} />;
};

export const Route = createFileRoute("/order/order_all")({
  validateSearch: (search: Record<string, unknown>): OrderAllSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
    order_system: str(search.order_system),
  }),
  component: OrderAllRoute,
});
