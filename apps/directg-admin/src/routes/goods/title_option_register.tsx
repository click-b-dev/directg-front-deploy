import { createFileRoute } from "@tanstack/react-router";
import { TitleOptionScreen } from "@screens/title-option";

// legacy pc/_Admin_/goods/title_option_register.php?title_id= → /goods/title_option_register
type Search = { title_id: number };

const TitleOptionRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleOptionScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_option_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleOptionRoute,
});
