import { createFileRoute } from "@tanstack/react-router";
import { EventBoardModifyScreen } from "@screens/event-board-modify";

// legacy pc/_Admin_/event/event_board_modify.php → /event/event_board_modify
const normIdx = (v: unknown) => {
  const n = Number(v);
  return !n || n < 0 ? 0 : n;
};

const EventBoardModifyRoute = () => {
  const { idx } = Route.useSearch();
  return <EventBoardModifyScreen idx={idx} />;
};

export const Route = createFileRoute("/event/event_board_modify")({
  validateSearch: (search: Record<string, unknown>): { idx: number } => ({
    idx: normIdx(search.idx),
  }),
  component: EventBoardModifyRoute,
});
