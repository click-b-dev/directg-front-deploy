import { createFileRoute } from "@tanstack/react-router";
import { EventBoardRegisterScreen } from "@screens/event-board-register";

// legacy pc/_Admin_/event/event_board_register.php → /event/event_board_register
const str = (value: unknown) => (typeof value === "string" ? value : "");
const normIdx = (v: unknown) => {
  const n = Number(v);
  return !n || n < 0 ? 0 : n;
};

const EventBoardRegisterRoute = () => {
  const { mode, idx } = Route.useSearch();
  return <EventBoardRegisterScreen mode={mode} idx={idx} />;
};

export const Route = createFileRoute("/event/event_board_register")({
  validateSearch: (search: Record<string, unknown>): { mode: string; idx: number } => ({
    mode: str(search.mode),
    idx: normIdx(search.idx),
  }),
  component: EventBoardRegisterRoute,
});
