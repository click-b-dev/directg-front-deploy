import { createFileRoute } from "@tanstack/react-router";
import { EventPointListScreen } from "@screens/event-point-list";

// legacy pc/_Admin_/event/event_point_list.php → /event/event_point_list
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

type EventPointSearchParams = {
  page: number;
  search_flag: string;
  search_status: string;
  search_key: string;
  search_value: string;
};

const EventPointListRoute = () => {
  const { page, search_flag, search_status, search_key, search_value } = Route.useSearch();
  return (
    <EventPointListScreen
      page={page}
      search_flag={search_flag}
      search_status={search_status}
      search_key={search_key}
      search_value={search_value}
    />
  );
};

export const Route = createFileRoute("/event/event_point_list")({
  validateSearch: (search: Record<string, unknown>): EventPointSearchParams => ({
    page: normPage(search.page),
    search_flag: str(search.search_flag),
    search_status: str(search.search_status),
    search_key: str(search.search_key),
    search_value: str(search.search_value),
  }),
  component: EventPointListRoute,
});
