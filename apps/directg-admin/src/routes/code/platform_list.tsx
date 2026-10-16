import { createFileRoute } from "@tanstack/react-router";
import { CodePlatformListScreen } from "@screens/code-platform-list";

// legacy pc/_Admin_/code/platform_list.php → /code/platform_list
export const Route = createFileRoute("/code/platform_list")({
  component: CodePlatformListScreen,
});
