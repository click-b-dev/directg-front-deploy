import { createFileRoute } from "@tanstack/react-router";
import { EventGiftMemberScreen } from "@screens/event-gift-member";

// legacy pc/_Admin_/event/event_gift_member.php → /event/event_gift_member
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};
const normIdx = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const EventGiftMemberRoute = () => {
  const { idx, page, searchTitle } = Route.useSearch();
  return <EventGiftMemberScreen idx={idx} page={page} searchTitle={searchTitle} />;
};

export const Route = createFileRoute("/event/event_gift_member")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { idx: number; page: number; searchTitle: string } => ({
    idx: normIdx(search.idx),
    page: normPage(search.page),
    searchTitle: str(search.searchTitle),
  }),
  component: EventGiftMemberRoute,
});
