import { createFileRoute } from "@tanstack/react-router";
import { OperationServiceScreen } from "@screens/operation-service";

// legacy pc/_Admin_/site/dg_operation_service.php → /site/dg_operation_service
export const Route = createFileRoute("/site/dg_operation_service")({
  component: OperationServiceScreen,
});
