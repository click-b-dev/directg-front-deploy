import { createFileRoute } from "@tanstack/react-router";
import { OrderGenbaSuccessScreen } from "@screens/order-genba-success";
import type { OrderGenbaSuccessSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_genba_success.php → /order/order_genba_success
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderGenbaSuccessRoute = () => {
  const search = Route.useSearch();
  return <OrderGenbaSuccessScreen {...search} />;
};

export const Route = createFileRoute("/order/order_genba_success")({
  validateSearch: (search: Record<string, unknown>): OrderGenbaSuccessSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderGenbaSuccessRoute,
});
