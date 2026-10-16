import { createFileRoute } from "@tanstack/react-router";
import { OrderShipmentAllScreen } from "@screens/order-shipment-all";
import type { OrderShipmentAllSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_shipment_all.php → /order/order_shipment_all
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderShipmentAllRoute = () => {
  const search = Route.useSearch();
  return <OrderShipmentAllScreen {...search} />;
};

export const Route = createFileRoute("/order/order_shipment_all")({
  validateSearch: (search: Record<string, unknown>): OrderShipmentAllSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
    search_shipment_status: str(search.search_shipment_status),
  }),
  component: OrderShipmentAllRoute,
});
