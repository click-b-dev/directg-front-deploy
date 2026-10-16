import { createFileRoute } from "@tanstack/react-router";
import { OrderDashboardScreen } from "@screens/order-dashboard";

// legacy pc/_Admin_/order/dashboard_order.php → /order/dashboard_order
export const Route = createFileRoute("/order/dashboard_order")({
  component: OrderDashboardScreen,
});
