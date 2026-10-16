import { createFileRoute } from "@tanstack/react-router";
import { GoodsGracBatchScreen } from "@screens/goods-grac-batch";

// legacy pc/_Admin_/goods/grac/grac_batch.php → /goods/grac/grac_batch
export const Route = createFileRoute("/goods/grac/grac_batch")({
  component: GoodsGracBatchScreen,
});
