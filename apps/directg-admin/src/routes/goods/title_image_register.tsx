import { createFileRoute } from "@tanstack/react-router";
import { TitleImageScreen } from "@screens/title-image";

// legacy pc/_Admin_/goods/title_image_register.php?title_id= → /goods/title_image_register
type Search = { title_id: number };

const TitleImageRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleImageScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_image_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleImageRoute,
});
