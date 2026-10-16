import { createFileRoute } from "@tanstack/react-router";
import { GenbaPublisherScreen } from "@screens/genba-publisher";

// legacy pc/_Admin_/goods/genba/genba_publisher.php → /goods/genba/genba_publisher
export const Route = createFileRoute("/goods/genba/genba_publisher")({
  component: GenbaPublisherScreen,
});
