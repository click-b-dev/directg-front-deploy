import { createFileRoute } from "@tanstack/react-router";
import { CodePublisherListScreen } from "@screens/code-publisher-list";
import type { PublisherSearch } from "@entities/code";

// legacy pc/_Admin_/code/publisher_list.php → /code/publisher_list
const str = (value: unknown) => (typeof value === "string" ? value : "");

const PublisherListRoute = () => {
  const search = Route.useSearch();
  return <CodePublisherListScreen {...search} />;
};

export const Route = createFileRoute("/code/publisher_list")({
  validateSearch: (search: Record<string, unknown>): PublisherSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: PublisherListRoute,
});
