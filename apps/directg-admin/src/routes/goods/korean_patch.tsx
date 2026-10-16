import { createFileRoute } from "@tanstack/react-router";
import { GoodsKoreanPatchScreen } from "@screens/goods-korean-patch";

// legacy pc/_Admin_/goods/korean_patch.php → /goods/korean_patch
export const Route = createFileRoute("/goods/korean_patch")({
  component: GoodsKoreanPatchScreen,
});
