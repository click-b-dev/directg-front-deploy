import { createFileRoute } from "@tanstack/react-router";
import { EventLotterySuccessScreen } from "@screens/event-lottery-success";

// legacy pc/_Admin_/event/event_lottery_success.php → /event/event_lottery_success
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};
const normEventNo = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const EventLotterySuccessRoute = () => {
  const { event_no, page, searchTitle } = Route.useSearch();
  return <EventLotterySuccessScreen event_no={event_no} page={page} searchTitle={searchTitle} />;
};

export const Route = createFileRoute("/event/event_lottery_success")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { event_no: number; page: number; searchTitle: string } => ({
    event_no: normEventNo(search.event_no),
    page: normPage(search.page),
    searchTitle: str(search.searchTitle),
  }),
  component: EventLotterySuccessRoute,
});
