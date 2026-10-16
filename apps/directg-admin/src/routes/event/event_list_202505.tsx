import { createFileRoute } from "@tanstack/react-router";
import { EventList202505Screen } from "@screens/event-list-202505";

// legacy pc/_Admin_/event/event_list_202505.php → /event/event_list_202505
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventList202505Route = () => {
  const { page } = Route.useSearch();
  return <EventList202505Screen page={page} />;
};

export const Route = createFileRoute("/event/event_list_202505")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: EventList202505Route,
});
