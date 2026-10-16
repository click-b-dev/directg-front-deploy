import { createFileRoute } from "@tanstack/react-router";
import { OrderZtormSuccessScreen } from "@screens/order-ztorm-success";
import type { OrderZtormSuccessSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_ztorm_success.php → /order/order_ztorm_success
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderZtormSuccessRoute = () => {
  const search = Route.useSearch();
  return <OrderZtormSuccessScreen {...search} />;
};

export const Route = createFileRoute("/order/order_ztorm_success")({
  validateSearch: (search: Record<string, unknown>): OrderZtormSuccessSearch => ({
    page: Number(search.page) || 1,
    search_ordno: str(search.search_ordno),
    search_ztorm_id: str(search.search_ztorm_id),
    search_m_id: str(search.search_m_id),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderZtormSuccessRoute,
});
