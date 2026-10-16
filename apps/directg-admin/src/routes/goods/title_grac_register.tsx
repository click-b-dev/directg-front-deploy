import { createFileRoute } from "@tanstack/react-router";
import { TitleGracScreen } from "@screens/title-grac";

// legacy pc/_Admin_/goods/title_grac_register.php?title_id= → /goods/title_grac_register
type Search = { title_id: number };

const TitleGracRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleGracScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_grac_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleGracRoute,
});
