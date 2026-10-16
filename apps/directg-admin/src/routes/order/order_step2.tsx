import { createFileRoute } from "@tanstack/react-router";
import { OrderStep2Screen } from "@screens/order-step2";
import type { OrderPaymentReadySearch } from "@entities/order";

// legacy pc/_Admin_/order/order_step2.php → /order/order_step2
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderStep2Route = () => {
  const search = Route.useSearch();
  return <OrderStep2Screen {...search} />;
};

export const Route = createFileRoute("/order/order_step2")({
  validateSearch: (search: Record<string, unknown>): OrderPaymentReadySearch => ({
    page: Number(search.page) || 1,
    search_settle_no: str(search.search_settle_no),
    search_m_id: str(search.search_m_id),
    search_pg_provider: str(search.search_pg_provider),
    search_payment_method: str(search.search_payment_method),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderStep2Route,
});
