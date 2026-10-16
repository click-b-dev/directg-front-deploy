import { createFileRoute } from "@tanstack/react-router";
import { TagGroupListScreen } from "@screens/tag-group-list";

// legacy pc/_Admin_/tag/tag_group_list.php → /tag/tag_group_list
export const Route = createFileRoute("/tag/tag_group_list")({
  component: TagGroupListScreen,
});
