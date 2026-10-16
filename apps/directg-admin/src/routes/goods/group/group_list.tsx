import { createFileRoute } from "@tanstack/react-router";
import { GoodsGroupListScreen } from "@screens/goods-group-list";

// legacy pc/_Admin_/goods/group/group_list.php → /goods/group/group_list
export const Route = createFileRoute("/goods/group/group_list")({
  component: GoodsGroupListScreen,
});
