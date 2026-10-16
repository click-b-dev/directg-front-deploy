import { createFileRoute } from "@tanstack/react-router";
import { CodeDeliveryMethodScreen } from "@screens/code-delivery-method";

// legacy pc/_Admin_/code/delivery_method.php → /code/delivery_method
export const Route = createFileRoute("/code/delivery_method")({
  component: CodeDeliveryMethodScreen,
});
