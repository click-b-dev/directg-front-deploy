import { createFileRoute } from "@tanstack/react-router";
import { TagGroupSettingScreen } from "@screens/tag-group-setting";

// legacy pc/_Admin_/tag/tag_group_setting.php → /tag/tag_group_setting
export const Route = createFileRoute("/tag/tag_group_setting")({
  component: TagGroupSettingScreen,
});
