import { createFileRoute } from "@tanstack/react-router";
import { EventGiftRequestScreen } from "@screens/event-gift-request";

// legacy pc/_Admin_/event/event_gift_request.php → /event/event_gift_request
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

type EventGiftRequestSearchParams = {
  page: number;
  search_type: string;
  search_value: string;
  status: string;
  event_gift_idx: string;
};

const EventGiftRequestRoute = () => {
  const { page, search_type, search_value, status, event_gift_idx } = Route.useSearch();
  return (
    <EventGiftRequestScreen
      page={page}
      search_type={search_type}
      search_value={search_value}
      status={status}
      event_gift_idx={event_gift_idx}
    />
  );
};

export const Route = createFileRoute("/event/event_gift_request")({
  validateSearch: (search: Record<string, unknown>): EventGiftRequestSearchParams => ({
    page: normPage(search.page),
    search_type: str(search.search_type),
    search_value: str(search.search_value),
    status: str(search.status),
    event_gift_idx: str(search.event_gift_idx),
  }),
  component: EventGiftRequestRoute,
});
