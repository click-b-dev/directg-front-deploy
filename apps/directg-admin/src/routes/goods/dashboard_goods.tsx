import { createFileRoute } from "@tanstack/react-router";
import { GoodsDashboardScreen } from "@screens/goods-dashboard";

// legacy pc/_Admin_/goods/dashboard_goods.php → /goods/dashboard_goods
export const Route = createFileRoute("/goods/dashboard_goods")({
  component: GoodsDashboardScreen,
});
