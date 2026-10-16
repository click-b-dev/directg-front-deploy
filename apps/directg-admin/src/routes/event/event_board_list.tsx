import { createFileRoute } from "@tanstack/react-router";
import { EventBoardListScreen } from "@screens/event-board-list";

// legacy pc/_Admin_/event/event_board_list.php → /event/event_board_list
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normPage = (v: unknown) => {
  const n = Number(v);
  return !n || n < 1 ? 1 : n;
};

const EventBoardListRoute = () => {
  const { page, is_view } = Route.useSearch();
  return <EventBoardListScreen page={page} is_view={is_view} />;
};

export const Route = createFileRoute("/event/event_board_list")({
  validateSearch: (search: Record<string, unknown>): { page: number; is_view: string } => ({
    page: normPage(search.page),
    is_view: str(search.is_view),
  }),
  component: EventBoardListRoute,
});
