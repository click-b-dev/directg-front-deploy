import { createFileRoute } from "@tanstack/react-router";
import { StockDashboardScreen } from "@screens/stock-dashboard";

// legacy pc/_Admin_/goods/stock/dashboard_stock.php → /goods/stock/dashboard_stock
export const Route = createFileRoute("/goods/stock/dashboard_stock")({
  component: StockDashboardScreen,
});
