import { createFileRoute } from "@tanstack/react-router";
import { BannerRegisterScreen } from "@screens/banner-register";

// legacy pc/_Admin_/site/banner_register.php → /site/banner_register
export const Route = createFileRoute("/site/banner_register")({
  component: BannerRegisterScreen,
});
