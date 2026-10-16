import { createFileRoute } from "@tanstack/react-router";
import { BoardDashboardScreen } from "@screens/board-dashboard";

// legacy pc/_Admin_/board/dashboard_board.php → /board/dashboard_board
export const Route = createFileRoute("/board/dashboard_board")({
  component: BoardDashboardScreen,
});
