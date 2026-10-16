import { createFileRoute } from "@tanstack/react-router";
import { MemberReadyScreen } from "@screens/member-ready";
import type { MemberReadyListSearch } from "@entities/member";

// legacy pc/_Admin_/member/member_list_ready.php → /member/member_list_ready
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberReadyRoute = () => {
  const search = Route.useSearch();
  return <MemberReadyScreen {...search} />;
};

export const Route = createFileRoute("/member/member_list_ready")({
  validateSearch: (search: Record<string, unknown>): MemberReadyListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: MemberReadyRoute,
});
