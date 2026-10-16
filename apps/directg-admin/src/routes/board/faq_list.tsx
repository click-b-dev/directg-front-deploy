import { createFileRoute } from "@tanstack/react-router";
import { FaqListScreen } from "@screens/faq-list";
import type { FaqListSearch } from "@entities/faq";

// legacy pc/_Admin_/board/faq_list.php → /board/faq_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const FaqListRoute = () => {
  const search = Route.useSearch();
  return <FaqListScreen {...search} />;
};

export const Route = createFileRoute("/board/faq_list")({
  validateSearch: (search: Record<string, unknown>): FaqListSearch => ({
    page: Number(search.page) || 1,
    search_item_cd: str(search.search_item_cd),
    search_subject: str(search.search_subject),
  }),
  component: FaqListRoute,
});
