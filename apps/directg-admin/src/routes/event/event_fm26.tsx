import { createFileRoute } from "@tanstack/react-router";
import { EventFm26Screen } from "@screens/event-fm26";

// legacy pc/_Admin_/event/event_fm26.php → /event/event_fm26
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventFm26Route = () => {
  const { page } = Route.useSearch();
  return <EventFm26Screen page={page} />;
};

export const Route = createFileRoute("/event/event_fm26")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: EventFm26Route,
});
