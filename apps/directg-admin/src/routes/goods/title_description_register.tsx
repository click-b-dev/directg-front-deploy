import { createFileRoute } from "@tanstack/react-router";
import { TitleDescriptionScreen } from "@screens/title-description";

// legacy pc/_Admin_/goods/title_description_register.php?title_id= → /goods/title_description_register
type Search = { title_id: number };

const TitleDescriptionRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleDescriptionScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_description_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleDescriptionRoute,
});
