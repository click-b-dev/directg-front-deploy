import { createFileRoute } from "@tanstack/react-router";
import { OrderVaultnSuccessScreen } from "@screens/order-vaultn-success";
import type { OrderVaultnSuccessSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_vaultn_success.php → /order/order_vaultn_success
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderVaultnSuccessRoute = () => {
  const search = Route.useSearch();
  return <OrderVaultnSuccessScreen {...search} />;
};

export const Route = createFileRoute("/order/order_vaultn_success")({
  validateSearch: (search: Record<string, unknown>): OrderVaultnSuccessSearch => ({
    page: Number(search.page) || 1,
    search_ordno: str(search.search_ordno),
    search_m_id: str(search.search_m_id),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderVaultnSuccessRoute,
});
