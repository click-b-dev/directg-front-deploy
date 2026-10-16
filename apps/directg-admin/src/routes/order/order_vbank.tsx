import { createFileRoute } from "@tanstack/react-router";
import { OrderVbankScreen } from "@screens/order-vbank";
import type { OrderVbankSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_vbank.php → /order/order_vbank
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderVbankRoute = () => {
  const search = Route.useSearch();
  return <OrderVbankScreen {...search} />;
};

export const Route = createFileRoute("/order/order_vbank")({
  validateSearch: (search: Record<string, unknown>): OrderVbankSearch => ({
    page: Number(search.page) || 1,
    search_settle_no: str(search.search_settle_no),
    search_m_id: str(search.search_m_id),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderVbankRoute,
});
