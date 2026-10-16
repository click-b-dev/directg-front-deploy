import { createFileRoute } from "@tanstack/react-router";
import { EventLotteryListScreen } from "@screens/event-lottery-list";

// legacy pc/_Admin_/event/event_lottery_list.php → /event/event_lottery_list
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventLotteryListRoute = () => {
  const { page } = Route.useSearch();
  return <EventLotteryListScreen page={page} />;
};

export const Route = createFileRoute("/event/event_lottery_list")({
  validateSearch: (search: Record<string, unknown>): { page: number } => ({
    page: normPage(search.page),
  }),
  component: EventLotteryListRoute,
});
