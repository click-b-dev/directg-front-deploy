import { createFileRoute } from "@tanstack/react-router";
import { BannerListScreen } from "@screens/banner-list";
import type { BannerFlag } from "@entities/main-banner";

// legacy pc/_Admin_/site/banner_list.php (?page&search_banner_title&search_flag) → /site/banner_list
type BannerListSearch = {
  page: number;
  search_banner_title: string;
  search_flag: BannerFlag | "";
};

const BannerListRoute = () => {
  const { page, search_banner_title, search_flag } = Route.useSearch();
  return (
    <BannerListScreen
      page={page}
      searchBannerTitle={search_banner_title}
      searchFlag={search_flag}
    />
  );
};

export const Route = createFileRoute("/site/banner_list")({
  validateSearch: (search: Record<string, unknown>): BannerListSearch => {
    const flag = search.search_flag;
    return {
      page: Number(search.page) || 1,
      search_banner_title:
        typeof search.search_banner_title === "string" ? search.search_banner_title : "",
      search_flag: flag === "Y" || flag === "N" ? flag : "",
    };
  },
  component: BannerListRoute,
});
