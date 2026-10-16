import { createFileRoute } from "@tanstack/react-router";
import { TitleAttributeSetScreen } from "@screens/title-attribute-set";

// legacy pc/_Admin_/goods/title_attribute_set_register.php?title_id= → /goods/title_attribute_set_register
type Search = { title_id: number };

const TitleAttributeSetRoute = () => {
  const { title_id } = Route.useSearch();
  return <TitleAttributeSetScreen titleId={title_id} />;
};

export const Route = createFileRoute("/goods/title_attribute_set_register")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    title_id: Number(search.title_id) || 0,
  }),
  component: TitleAttributeSetRoute,
});
