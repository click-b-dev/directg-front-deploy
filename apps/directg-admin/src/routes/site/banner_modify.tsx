import { createFileRoute } from "@tanstack/react-router";
import { BannerModifyScreen } from "@screens/banner-modify";

// legacy pc/_Admin_/site/banner_modify.php?idx= → /site/banner_modify?idx=
type BannerModifySearch = { idx: number };

const BannerModifyRoute = () => {
  const { idx } = Route.useSearch();
  return <BannerModifyScreen idx={idx} />;
};

export const Route = createFileRoute("/site/banner_modify")({
  validateSearch: (search: Record<string, unknown>): BannerModifySearch => ({
    idx: Number(search.idx) || 0,
  }),
  component: BannerModifyRoute,
});
