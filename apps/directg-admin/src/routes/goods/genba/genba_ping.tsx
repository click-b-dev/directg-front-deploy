import { createFileRoute } from "@tanstack/react-router";
import { GenbaPingScreen } from "@screens/genba-ping";

// legacy pc/_Admin_/goods/genba/genba_ping.php → /goods/genba/genba_ping
export const Route = createFileRoute("/goods/genba/genba_ping")({
  component: GenbaPingScreen,
});
