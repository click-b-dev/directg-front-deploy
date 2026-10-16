import { createFileRoute } from "@tanstack/react-router";
import { OrderAssetKeyBulkScreen } from "@screens/order-asset-key-bulk";

// legacy pc/_Admin_/order/order_asset_key_bulk.php → /order/order_asset_key_bulk (POST 입력, URL 파라미터 없음)
export const Route = createFileRoute("/order/order_asset_key_bulk")({
  component: OrderAssetKeyBulkScreen,
});
