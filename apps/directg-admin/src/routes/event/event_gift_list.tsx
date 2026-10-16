import { createFileRoute } from "@tanstack/react-router";
import { EventGiftListScreen } from "@screens/event-gift-list";

// legacy pc/_Admin_/event/event_gift_list.php → /event/event_gift_list
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventGiftListRoute = () => {
  const { page } = Route.useSearch();
  return <EventGiftListScreen page={page} />;
};

export const Route = createFileRoute("/event/event_gift_list")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: EventGiftListRoute,
});
