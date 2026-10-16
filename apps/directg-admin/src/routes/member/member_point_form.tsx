import { createFileRoute } from "@tanstack/react-router";
import { MemberPointFormScreen } from "@screens/member-point-form";

// legacy pc/_Admin_/member/member_point_form.php → /member/member_point_form
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v));

type MemberPointFormSearch = { search_type: string; search_value: string };

const MemberPointFormRoute = () => {
  const search = Route.useSearch();
  return <MemberPointFormScreen {...search} />;
};

export const Route = createFileRoute("/member/member_point_form")({
  validateSearch: (search: Record<string, unknown>): MemberPointFormSearch => ({
    search_type: str(search.search_type),
    search_value: str(search.search_value),
  }),
  component: MemberPointFormRoute,
});
