import { createFileRoute } from "@tanstack/react-router";
import { AssetCodeRegisterScreen } from "@screens/asset-code-register";

// legacy pc/_Admin_/goods/asset/asset_code_register.php → /goods/asset/asset_code_register
export const Route = createFileRoute("/goods/asset/asset_code_register")({
  component: AssetCodeRegisterScreen,
});
