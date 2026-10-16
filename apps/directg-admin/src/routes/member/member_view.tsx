import { createFileRoute } from "@tanstack/react-router";
import { MemberViewScreen } from "@screens/member-view";

// legacy pc/_Admin_/member/member_view.php → /member/member_view
type MemberViewSearch = { m_no: string };

const MemberViewRoute = () => {
  const { m_no } = Route.useSearch();
  return <MemberViewScreen m_no={m_no} />;
};

export const Route = createFileRoute("/member/member_view")({
  validateSearch: (search: Record<string, unknown>): MemberViewSearch => ({
    m_no: search.m_no === undefined || search.m_no === null ? "" : String(search.m_no),
  }),
  component: MemberViewRoute,
});
