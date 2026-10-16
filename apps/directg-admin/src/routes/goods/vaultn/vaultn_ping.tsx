import { createFileRoute } from "@tanstack/react-router";
import { VaultnPingScreen } from "@screens/vaultn-ping";

// legacy pc/_Admin_/goods/vaultn/vaultn_ping.php → /goods/vaultn/vaultn_ping
export const Route = createFileRoute("/goods/vaultn/vaultn_ping")({
  component: VaultnPingScreen,
});
