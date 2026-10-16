import { createFileRoute } from "@tanstack/react-router";
import { MemberListScreen } from "@screens/member-list";
import type { MemberListSearch } from "@entities/member";

// legacy pc/_Admin_/member/member_list.php → /member/member_list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberListRoute = () => {
  const search = Route.useSearch();
  return <MemberListScreen {...search} />;
};

export const Route = createFileRoute("/member/member_list")({
  validateSearch: (search: Record<string, unknown>): MemberListSearch => ({
    page: Number(search.page) || 1,
    search_type: str(search.search_type),
    search_value: str(search.search_value),
    member_level: Number(search.member_level) || 0,
    old_login: str(search.old_login),
    mailling: str(search.mailling),
    is_auth: str(search.is_auth),
    mem_type: str(search.mem_type),
    start_reg_date: str(search.start_reg_date),
    end_reg_date: str(search.end_reg_date),
    start_log_date: str(search.start_log_date),
    end_log_date: str(search.end_log_date),
    sort: str(search.sort),
    dir: str(search.dir),
  }),
  component: MemberListRoute,
});
