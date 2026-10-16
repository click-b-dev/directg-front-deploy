import { createFileRoute } from "@tanstack/react-router";
import { TitleListScreen, type TitleListSearch } from "@screens/title-list";

// legacy pc/_Admin_/goods/title_list.php (?page&search_* 9종) → /goods/title_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const TitleListRoute = () => {
  const search = Route.useSearch();
  return <TitleListScreen {...search} />;
};

export const Route = createFileRoute("/goods/title_list")({
  validateSearch: (search: Record<string, unknown>): TitleListSearch => ({
    page: Number(search.page) || 1,
    search_key: str(search.search_key),
    search_value: str(search.search_value),
    search_is_view: str(search.search_is_view),
    search_sales_status: str(search.search_sales_status),
    search_age_limit: str(search.search_age_limit),
    search_interface_korean: str(search.search_interface_korean),
    search_subtitle_korean: str(search.search_subtitle_korean),
    search_spoken_korean: str(search.search_spoken_korean),
    search_exclusive_korean: str(search.search_exclusive_korean),
  }),
  component: TitleListRoute,
});
