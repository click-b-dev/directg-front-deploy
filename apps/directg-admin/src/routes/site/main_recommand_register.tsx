import { createFileRoute } from "@tanstack/react-router";
import { RecommandRegisterScreen } from "@screens/recommand-register";

// legacy pc/_Admin_/site/main_recommand_register.php (register 모드) → /site/main_recommand_register
export const Route = createFileRoute("/site/main_recommand_register")({
  component: RecommandRegisterScreen,
});
