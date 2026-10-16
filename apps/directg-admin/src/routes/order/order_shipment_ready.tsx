import { createFileRoute } from "@tanstack/react-router";
import { OrderShipmentReadyScreen } from "@screens/order-shipment-ready";
import type { OrderShipmentFixedSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_shipment_ready.php → /order/order_shipment_ready
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderShipmentReadyRoute = () => {
  const search = Route.useSearch();
  return <OrderShipmentReadyScreen {...search} />;
};

export const Route = createFileRoute("/order/order_shipment_ready")({
  validateSearch: (search: Record<string, unknown>): OrderShipmentFixedSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderShipmentReadyRoute,
});
