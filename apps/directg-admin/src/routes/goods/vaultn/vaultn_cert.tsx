import { createFileRoute } from "@tanstack/react-router";
import { VaultnCertScreen } from "@screens/vaultn-cert";

// legacy pc/_Admin_/goods/vaultn/vaultn_cert.php → /goods/vaultn/vaultn_cert
export const Route = createFileRoute("/goods/vaultn/vaultn_cert")({
  component: VaultnCertScreen,
});
