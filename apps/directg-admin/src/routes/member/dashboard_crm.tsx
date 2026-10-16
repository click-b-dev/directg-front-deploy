import { createFileRoute } from "@tanstack/react-router";
import { MemberDashboardScreen } from "@screens/member-dashboard";

// legacy pc/_Admin_/member/dashboard_crm.php → /member/dashboard_crm
export const Route = createFileRoute("/member/dashboard_crm")({
  component: MemberDashboardScreen,
});
