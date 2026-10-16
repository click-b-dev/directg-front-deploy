import { createFileRoute } from "@tanstack/react-router";
import { DashboardScreen } from "@screens/dashboard";

// legacy pc/_Admin_/main.php (대시보드, topnav 레이아웃) → /main
export const Route = createFileRoute("/main")({
  component: DashboardScreen,
});
