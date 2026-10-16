import { createFileRoute } from "@tanstack/react-router";
import { TitleMediaScreen } from "@screens/title-media";

// legacy pc/_Admin_/goods/title_media_register.php?title_id= → /goods/title_media_register
type Search = { title_id: number };

const TitleMediaRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleMediaScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_media_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleMediaRoute,
});
