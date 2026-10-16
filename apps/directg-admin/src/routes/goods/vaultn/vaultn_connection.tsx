import { createFileRoute } from "@tanstack/react-router";
import { VaultnConnectionScreen } from "@screens/vaultn-connection";

// legacy pc/_Admin_/goods/vaultn/vaultn_connection.php → /goods/vaultn/vaultn_connection
export const Route = createFileRoute("/goods/vaultn/vaultn_connection")({
  component: VaultnConnectionScreen,
});
