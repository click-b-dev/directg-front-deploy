import { createFileRoute } from "@tanstack/react-router";
import { TitleDescriptionV2Screen } from "@screens/title-description-v2";

// legacy pc/_Admin_/goods/title_description_register_v2.php?title_id= → /goods/title_description_register_v2
type Search = { title_id: number };

const TitleDescriptionV2Route = () => {
  const { title_id } = Route.useSearch();
  return <TitleDescriptionV2Screen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_description_register_v2")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleDescriptionV2Route,
});
