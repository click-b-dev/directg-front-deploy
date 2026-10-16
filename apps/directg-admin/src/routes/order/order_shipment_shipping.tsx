import { createFileRoute } from "@tanstack/react-router";
import { OrderShipmentShippingScreen } from "@screens/order-shipment-shipping";
import type { OrderShipmentFixedSearch } from "@entities/order";

// legacy pc/_Admin_/order/order_shipment_shipping.php → /order/order_shipment_shipping
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const OrderShipmentShippingRoute = () => {
  const search = Route.useSearch();
  return <OrderShipmentShippingScreen {...search} />;
};

export const Route = createFileRoute("/order/order_shipment_shipping")({
  validateSearch: (search: Record<string, unknown>): OrderShipmentFixedSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_start_date: str(search.search_start_date),
    search_end_date: str(search.search_end_date),
    date_label: str(search.date_label),
  }),
  component: OrderShipmentShippingRoute,
});
