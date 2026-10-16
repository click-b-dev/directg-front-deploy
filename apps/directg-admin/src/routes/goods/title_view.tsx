import { createFileRoute } from "@tanstack/react-router";
import { TitleViewScreen } from "@screens/title-view";

// legacy pc/_Admin_/goods/title_view.php?title_id= → /goods/title_view
type TitleViewSearch = { title_id: number };

const TitleViewRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleViewScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_view")({
  validateSearch: (search: Record<string, unknown>): TitleViewSearch => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleViewRoute,
});
