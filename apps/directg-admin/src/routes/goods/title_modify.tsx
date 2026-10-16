import { createFileRoute } from "@tanstack/react-router";
import { TitleModifyScreen } from "@screens/title-modify";

// legacy pc/_Admin_/goods/title_modify.php?title_id= → /goods/title_modify
type TitleModifySearch = { title_id: number };

const TitleModifyRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleModifyScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_modify")({
  validateSearch: (search: Record<string, unknown>): TitleModifySearch => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleModifyRoute,
});
