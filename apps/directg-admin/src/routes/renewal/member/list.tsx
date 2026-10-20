import { createFileRoute } from "@tanstack/react-router";
import type { MemberListQuery } from "@/renewal/entities/member-list";
import { parsePageSize } from "@/renewal/shared/lib/pagination";
import { EMPTY_SEARCH, MemberListScreen } from "@/renewal/screens/member-list";

// Figma AD-Member-List-01 (회원 내역) → /renewal/member/list
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

const MemberListRoute = () => {
  const search = { ...EMPTY_SEARCH, ...Route.useSearch() };
  return <MemberListScreen search={search} />;
};

export const Route = createFileRoute("/renewal/member/list")({
  validateSearch: (search: Record<string, unknown>): Partial<MemberListQuery> => ({
    page: Number(search.page) || 1,
    per_page: parsePageSize(search.per_page),
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
