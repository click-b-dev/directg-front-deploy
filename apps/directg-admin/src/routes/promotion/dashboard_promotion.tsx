import { createFileRoute } from "@tanstack/react-router";
import { PromotionDashboardScreen } from "@screens/promotion-dashboard";

// legacy pc/_Admin_/promotion/dashboard_promotion.php → /promotion/dashboard_promotion
export const Route = createFileRoute("/promotion/dashboard_promotion")({
  component: PromotionDashboardScreen,
});
