import { createFileRoute } from "@tanstack/react-router";
import { TitleTagScreen } from "@screens/title-tag";

// legacy pc/_Admin_/goods/title_tag_register.php?title_id= → /goods/title_tag_register
type Search = { title_id: number };

const TitleTagRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleTagScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_tag_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleTagRoute,
});
