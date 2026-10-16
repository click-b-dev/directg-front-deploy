import { createFileRoute } from "@tanstack/react-router";
import { AssetRegisterScreen } from "@screens/asset-register";

// legacy pc/_Admin_/goods/asset/asset_register.php → /goods/asset/asset_register
export const Route = createFileRoute("/goods/asset/asset_register")({
  component: AssetRegisterScreen,
});
