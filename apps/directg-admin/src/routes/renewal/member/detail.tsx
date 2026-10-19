import { createFileRoute } from "@tanstack/react-router";
import { MemberDetailScreen } from "@/renewal/screens/member-detail";

// Figma 회원_회원내역_상세_주문내역 → /renewal/member/detail?m_no=
type MemberDetailSearch = { m_no: string };

const MemberDetailRoute = () => {
  const { m_no } = Route.useSearch();
  return <MemberDetailScreen m_no={m_no} />;
};

export const Route = createFileRoute("/renewal/member/detail")({
  validateSearch: (search: Record<string, unknown>): MemberDetailSearch => ({
    m_no: search.m_no === undefined || search.m_no === null ? "" : String(search.m_no),
  }),
  component: MemberDetailRoute,
});
