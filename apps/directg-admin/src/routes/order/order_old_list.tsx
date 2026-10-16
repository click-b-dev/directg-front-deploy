import { createFileRoute } from "@tanstack/react-router";
import { OrderOldListScreen } from "@screens/order-old-list";
import type { OrderOldListSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_old_list.php → /order/order_old_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderOldListRoute = () => {
  const search = Route.useSearch();
  return <OrderOldListScreen {...search} />;
};

export const Route = createFileRoute("/order/order_old_list")({
  validateSearch: (search: Record<string, unknown>): OrderOldListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
    search_year: str(search.search_year),
  }),
  component: OrderOldListRoute,
});
