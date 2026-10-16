import { createFileRoute } from "@tanstack/react-router";
import { ZtormPingScreen } from "@screens/ztorm-ping";

// legacy pc/_Admin_/goods/ztorm/ztorm_ping.php → /goods/ztorm/ztorm_ping
export const Route = createFileRoute("/goods/ztorm/ztorm_ping")({
  component: ZtormPingScreen,
});
