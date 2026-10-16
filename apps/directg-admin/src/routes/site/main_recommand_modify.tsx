import { createFileRoute } from "@tanstack/react-router";
import { RecommandModifyScreen } from "@screens/recommand-modify";

// legacy pc/_Admin_/site/main_recommand_modify.php?idx= → /site/main_recommand_modify?idx=
type RecommandModifySearch = { idx: number };

const RecommandModifyRoute = () => {
  const { idx } = Route.useSearch();
  return <RecommandModifyScreen idx={idx} />;
};

export const Route = createFileRoute("/site/main_recommand_modify")({
  validateSearch: (search: Record<string, unknown>): RecommandModifySearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: RecommandModifyRoute,
});
