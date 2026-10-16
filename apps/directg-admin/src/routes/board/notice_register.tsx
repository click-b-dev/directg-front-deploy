import { createFileRoute } from "@tanstack/react-router";
import { NoticeRegisterScreen, type NoticeRegisterSearch } from "@screens/notice-register";

// legacy pc/_Admin_/board/notice_register.php → /board/notice_register
const str = (value: unknown) => (typeof value === "string" ? value : "");

const NoticeRegisterRoute = () => {
  const search = Route.useSearch();
  return <NoticeRegisterScreen {...search} />;
};

export const Route = createFileRoute("/board/notice_register")({
  validateSearch: (search: Record<string, unknown>): NoticeRegisterSearch => ({
    mode: str(search.mode),
    idx: Number(search.idx) || 0,
  }),
  component: NoticeRegisterRoute,
});
