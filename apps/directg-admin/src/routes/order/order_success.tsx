import { createFileRoute } from "@tanstack/react-router";
import { OrderSuccessScreen } from "@screens/order-success";
import type { OrderSuccessSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_success.php → /order/order_success
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderSuccessRoute = () => {
  const search = Route.useSearch();
  return <OrderSuccessScreen {...search} />;
};

export const Route = createFileRoute("/order/order_success")({
  validateSearch: (search: Record<string, unknown>): OrderSuccessSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
    order_system: str(search.order_system),
    search_is_actv: str(search.search_is_actv),
    search_delivery_type: str(search.search_delivery_type),
    search_price_min: str(search.search_price_min),
    search_price_max: str(search.search_price_max),
  }),
  component: OrderSuccessRoute,
});
