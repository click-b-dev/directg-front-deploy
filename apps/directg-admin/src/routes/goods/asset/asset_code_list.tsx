import { createFileRoute } from "@tanstack/react-router";
import { AssetCodeListScreen } from "@screens/asset-code-list";

// legacy pc/_Admin_/goods/asset/asset_code_list.php → /goods/asset/asset_code_list
export const Route = createFileRoute("/goods/asset/asset_code_list")({
  component: AssetCodeListScreen,
});
