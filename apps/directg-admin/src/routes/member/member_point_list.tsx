import { createFileRoute } from "@tanstack/react-router";
import { MemberPointListScreen } from "@screens/member-point-list";
import type { MemberPointListSearch } from "@entities/member";

// legacy pc/_Admin_/member/member_point_list.php → /member/member_point_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberPointListRoute = () => {
  const search = Route.useSearch();
  return <MemberPointListScreen {...search} />;
};

export const Route = createFileRoute("/member/member_point_list")({
  validateSearch: (search: Record<string, unknown>): MemberPointListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
    emoney_type: str(search.emoney_type),
  }),
  component: MemberPointListRoute,
});
