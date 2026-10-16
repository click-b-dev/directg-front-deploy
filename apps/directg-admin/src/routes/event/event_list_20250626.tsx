import { createFileRoute } from "@tanstack/react-router";
import { EventList20250626Screen } from "@screens/event-list-20250626";

// legacy pc/_Admin_/event/event_list_20250626.php → /event/event_list_20250626
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventList20250626Route = () => {
  const { page } = Route.useSearch();
  return <EventList20250626Screen page={page} />;
};

export const Route = createFileRoute("/event/event_list_20250626")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: EventList20250626Route,
});
