import { createFileRoute } from "@tanstack/react-router";
import { ZtormPublisherListScreen } from "@screens/ztorm-publisher-list";

// legacy pc/_Admin_/goods/ztorm/ztorm_publisher_list.php → /goods/ztorm/ztorm_publisher_list
export const Route = createFileRoute("/goods/ztorm/ztorm_publisher_list")({
  component: ZtormPublisherListScreen,
});
